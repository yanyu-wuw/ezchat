import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { ApiResponse, Consultation, StudentProgress } from "@ezchat/types";
import { initDatabase, query, queryOne, execute } from "./db";
import { getAIResponse, getAIConfig } from "./ai";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.SERVER_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface DecodedToken {
  userId: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: DecodedToken;
}

// Express middleware setup
app.use(cors());
app.use(express.json());

// In-memory storage (fallback, should use database in production)
const users = new Map();
const consultations = new Map();
const knowledgeBase = new Map();
const studentProfiles = new Map();

// JWT Middleware
const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

const authorizeRole =
  (roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    next();
  };

// ==================== Authentication Routes ====================
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { email, password, username, role } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  if (users.has(email)) {
    return res
      .status(409)
      .json({ success: false, error: "User already exists" });
  }

  const userId = `user_${Date.now()}`;
  const newUser = {
    id: userId,
    username,
    email,
    password,
    role: role || "student",
    status: "active",
    created_at: new Date(),
    updated_at: new Date(),
  };

  users.set(email, newUser);

  if (newUser.role === "student") {
    studentProfiles.set(userId, {
      id: `profile_${userId}`,
      user_id: userId,
      total_questions: 0,
      total_study_time: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  const response: ApiResponse<any> = {
    success: true,
    data: { id: userId, email, username, role: newUser.role },
    timestamp: new Date(),
  };

  res.status(201).json(response);
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password required" });
  }

  const user = users.get(email);

  if (!user || user.password !== password) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });

  const response: ApiResponse<any> = {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    },
    timestamp: new Date(),
  };

  res.json(response);
});

app.post(
  "/api/auth/logout",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const response: ApiResponse<null> = {
      success: true,
      data: null,
      timestamp: new Date(),
    };
    res.json(response);
  },
);

app.post(
  "/api/auth/refresh",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const token = jwt.sign(
      { userId: req.user!.userId, role: req.user!.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    const response: ApiResponse<any> = {
      success: true,
      data: { token },
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== User Management Routes ====================
app.get(
  "/api/users",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const userList = Array.from(users.values()).map(
      ({ password, ...user }) => user,
    );

    const response: ApiResponse<any[]> = {
      success: true,
      data: userList,
      timestamp: new Date(),
    };
    res.json(response);
  },
);

app.get(
  "/api/users/:id",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const user = Array.from(users.values()).find(
      (u: any) => u.id === req.params.id,
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    const response: ApiResponse<any> = {
      success: true,
      data: userWithoutPassword,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.put(
  "/api/users/:id",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const user = Array.from(users.entries()).find(
      ([, u]: any) => u.id === req.params.id,
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const [email, userData] = user;
    const updates = { ...userData, ...req.body, updated_at: new Date() };
    users.set(email, updates);

    const { password, ...userWithoutPassword } = updates;

    const response: ApiResponse<any> = {
      success: true,
      data: userWithoutPassword,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.delete(
  "/api/users/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const user = Array.from(users.entries()).find(
      ([, u]: any) => u.id === req.params.id,
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    users.delete(user[0]);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.get(
  "/api/users/:id/profile",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const profile = studentProfiles.get(req.params.id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }

    const response: ApiResponse<any> = {
      success: true,
      data: profile,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== Consultation Routes ====================
app.post(
  "/api/consultation/ask",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { question } = req.body;

    if (!question) {
      return res
        .status(400)
        .json({ success: false, error: "Question required" });
    }

    try {
      // 使用 AI 服务生成响应
      const aiResponse = await getAIResponse(question);

      const consultationId = `consultation_${Date.now()}`;
      const consultation: Consultation = {
        id: consultationId,
        student_id: req.user!.userId,
        question,
        ai_response: aiResponse,
        status: "completed",
        created_at: new Date(),
        updated_at: new Date(),
      };

      consultations.set(consultationId, consultation);

      // 更新学生档案
      const profile = studentProfiles.get(req.user!.userId);
      if (profile) {
        profile.total_questions += 1;
        studentProfiles.set(req.user!.userId, profile);
      }

      const response: ApiResponse<Consultation> = {
        success: true,
        data: consultation,
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("[Error] Consultation ask failed:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to process consultation" });
    }
  },
);

app.get(
  "/api/consultation/history",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const history = Array.from(consultations.values()).filter(
      (c: any) => c.student_id === req.user!.userId,
    );

    const response: ApiResponse<Consultation[]> = {
      success: true,
      data: history,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.get(
  "/api/consultation/:id",
  authenticateToken,
  (req: Request, res: Response) => {
    const consultation = consultations.get(req.params.id);

    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, error: "Consultation not found" });
    }

    const response: ApiResponse<Consultation> = {
      success: true,
      data: consultation,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.post(
  "/api/consultation/:id/feedback",
  authenticateToken,
  (req: Request, res: Response) => {
    const { rating } = req.body;
    const consultation = consultations.get(req.params.id);

    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, error: "Consultation not found" });
    }

    consultation.updated_at = new Date();
    consultations.set(req.params.id, consultation);

    const response: ApiResponse<any> = {
      success: true,
      data: { message: "Feedback recorded", rating },
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== Content Management Routes ====================
app.post(
  "/api/content/knowledge",
  authenticateToken,
  authorizeRole(["admin", "teacher"]),
  (req: Request, res: Response) => {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, error: "Title and content required" });
    }

    const id = `knowledge_${Date.now()}`;
    const knowledge = {
      id,
      title,
      content,
      category: category || "general",
      created_by: "system",
      created_at: new Date(),
      updated_at: new Date(),
    };

    knowledgeBase.set(id, knowledge);

    const response: ApiResponse<any> = {
      success: true,
      data: knowledge,
      timestamp: new Date(),
    };

    res.status(201).json(response);
  },
);

app.get("/api/content/knowledge", (req: Request, res: Response) => {
  const knowledge = Array.from(knowledgeBase.values());

  const response: ApiResponse<any[]> = {
    success: true,
    data: knowledge,
    timestamp: new Date(),
  };

  res.json(response);
});

app.put(
  "/api/content/knowledge/:id",
  authenticateToken,
  authorizeRole(["admin", "teacher"]),
  (req: Request, res: Response) => {
    const knowledge = knowledgeBase.get(req.params.id);

    if (!knowledge) {
      return res
        .status(404)
        .json({ success: false, error: "Knowledge not found" });
    }

    const updated = { ...knowledge, ...req.body, updated_at: new Date() };
    knowledgeBase.set(req.params.id, updated);

    const response: ApiResponse<any> = {
      success: true,
      data: updated,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.delete(
  "/api/content/knowledge/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    knowledgeBase.delete(req.params.id);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== Analytics Routes ====================
app.get(
  "/api/analytics/dashboard",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const totalUsers = users.size;
    const activeUsers = Array.from(users.values()).filter(
      (u: any) => u.status === "active",
    ).length;
    const totalConsultations = consultations.size;

    const analytics = {
      total_users: totalUsers,
      active_users: activeUsers,
      new_users_today: Math.floor(Math.random() * 10),
      total_consultations: totalConsultations,
      average_response_time: 1.2,
    };

    const response: ApiResponse<any> = {
      success: true,
      data: analytics,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.get(
  "/api/analytics/user-progress/:id",
  authenticateToken,
  (req: Request, res: Response) => {
    const profile = studentProfiles.get(req.params.id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }

    const progress: StudentProgress = {
      student_id: req.params.id,
      total_questions_asked: profile.total_questions,
      avg_satisfaction: Math.random() * 5,
      learning_time_hours: profile.total_study_time,
      last_consultation_date: new Date(),
      progress_percentage: Math.min(100, (profile.total_questions / 50) * 100),
    };

    const response: ApiResponse<StudentProgress> = {
      success: true,
      data: progress,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.get(
  "/api/analytics/ai-performance",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const performance = {
      total_queries: consultations.size,
      average_satisfaction: 4.2,
      response_time_ms: 1200,
      success_rate: 0.95,
    };

    const response: ApiResponse<any> = {
      success: true,
      data: performance,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== AI Configuration Routes ====================
app.post(
  "/api/ai/config",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req: Request, res: Response) => {
    const { model_name, temperature, max_tokens, system_prompt } = req.body;

    const config = {
      id: `config_${Date.now()}`,
      model_name: model_name || "mixtral-8x7b-32768",
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2000,
      system_prompt: system_prompt || "You are a helpful learning assistant.",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const response: ApiResponse<any> = {
      success: true,
      data: config,
      timestamp: new Date(),
    };

    res.status(201).json(response);
  },
);

app.get("/api/ai/config", async (req: Request, res: Response) => {
  const config = await getAIConfig();

  const response: ApiResponse<any> = {
    success: true,
    data: config,
    timestamp: new Date(),
  };

  res.json(response);
});

// ==================== Health Check ====================
app.get("/api/health", (req: Request, res: Response) => {
  const response: ApiResponse<any> = {
    success: true,
    data: {
      status: "ok",
      database: "connected",
      ai: process.env.GROQ_API_KEY ? "configured" : "mock",
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  };
  res.json(response);
});

// ==================== WebSocket for Real-time Consultation ====================
io.on("connection", (socket: Socket) => {
  console.log(`[WebSocket] User connected: ${socket.id}`);

  socket.on(
    "consultation:connect",
    (data: { userId: string; token: string }) => {
      console.log(`[Consultation] User ${data.userId} connected`);
      socket.emit("consultation:ready", { status: "ready" });
    },
  );

  socket.on(
    "consultation:message",
    async (data: { userId: string; message: string }) => {
      console.log(`[Consultation] Message: ${data.message}`);
      try {
        const aiResponse = await getAIResponse(data.message);
        const response = {
          id: `response_${Date.now()}`,
          message: aiResponse,
          timestamp: new Date(),
        };
        socket.emit("consultation:response", response);
      } catch (error) {
        socket.emit("consultation:error", {
          error: "Failed to get AI response",
        });
      }
    },
  );

  socket.on("disconnect", () => {
    console.log(`[WebSocket] User disconnected: ${socket.id}`);
  });
});

// ==================== Error Handling ====================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Error]", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date(),
  });
});

// ==================== Server Startup ====================
async function startServer() {
  try {
    // 初始化数据库
    console.log("[Server] Initializing database...");
    await initDatabase();

    // 启动 HTTP 服务器
    httpServer.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(
        `[Environment] NODE_ENV=${process.env.NODE_ENV || "development"}`,
      );
      console.log(
        `[AI] Provider=${process.env.GROQ_API_KEY ? "Groq" : "Mock"}`,
      );
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

startServer();

// JWT Middleware
const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

const authorizeRole =
  (roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    next();
  };

// ==================== Authentication Routes ====================
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { email, password, username, role } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  if (users.has(email)) {
    return res
      .status(409)
      .json({ success: false, error: "User already exists" });
  }

  const userId = `user_${Date.now()}`;
  const newUser = {
    id: userId,
    username,
    email,
    password,
    role: role || "student",
    status: "active",
    created_at: new Date(),
    updated_at: new Date(),
  };

  users.set(email, newUser);

  if (newUser.role === "student") {
    studentProfiles.set(userId, {
      id: `profile_${userId}`,
      user_id: userId,
      total_questions: 0,
      total_study_time: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  const response: ApiResponse<any> = {
    success: true,
    data: { id: userId, email, username, role: newUser.role },
    timestamp: new Date(),
  };

  res.status(201).json(response);
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password required" });
  }

  const user = users.get(email);

  if (!user || user.password !== password) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });

  const response: ApiResponse<any> = {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    },
    timestamp: new Date(),
  };

  res.json(response);
});

app.post(
  "/api/auth/logout",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const response: ApiResponse<null> = {
      success: true,
      data: null,
      timestamp: new Date(),
    };
    res.json(response);
  },
);

app.post(
  "/api/auth/refresh",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const token = jwt.sign(
      { userId: req.user!.userId, role: req.user!.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    const response: ApiResponse<any> = {
      success: true,
      data: { token },
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== User Management Routes ====================
app.get(
  "/api/users",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const userList = Array.from(users.values()).map(
      ({ password, ...user }) => user,
    );

    const response: ApiResponse<any[]> = {
      success: true,
      data: userList,
      timestamp: new Date(),
    };
    res.json(response);
  },
);

app.get(
  "/api/users/:id",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const user = Array.from(users.values()).find(
      (u: any) => u.id === req.params.id,
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    const response: ApiResponse<any> = {
      success: true,
      data: userWithoutPassword,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.put(
  "/api/users/:id",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const user = Array.from(users.entries()).find(
      ([, u]: any) => u.id === req.params.id,
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const [email, userData] = user;
    const updates = { ...userData, ...req.body, updated_at: new Date() };
    users.set(email, updates);

    const { password, ...userWithoutPassword } = updates;

    const response: ApiResponse<any> = {
      success: true,
      data: userWithoutPassword,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.delete(
  "/api/users/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const user = Array.from(users.entries()).find(
      ([, u]: any) => u.id === req.params.id,
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    users.delete(user[0]);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.get(
  "/api/users/:id/profile",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const profile = studentProfiles.get(req.params.id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }

    const response: ApiResponse<any> = {
      success: true,
      data: profile,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== Consultation Routes ====================
app.post(
  "/api/consultation/ask",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const { question } = req.body;

    if (!question) {
      return res
        .status(400)
        .json({ success: false, error: "Question required" });
    }

    const consultationId = `consultation_${Date.now()}`;
    const consultation: Consultation = {
      id: consultationId,
      student_id: req.user!.userId,
      question,
      ai_response:
        "This is a placeholder response. In production, connect to your AI service.",
      status: "completed",
      created_at: new Date(),
      updated_at: new Date(),
    };

    consultations.set(consultationId, consultation);

    const profile = studentProfiles.get(req.user!.userId);
    if (profile) {
      profile.total_questions += 1;
      studentProfiles.set(req.user!.userId, profile);
    }

    const response: ApiResponse<Consultation> = {
      success: true,
      data: consultation,
      timestamp: new Date(),
    };

    res.status(201).json(response);
  },
);

app.get(
  "/api/consultation/history",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    const history = Array.from(consultations.values()).filter(
      (c: any) => c.student_id === req.user!.userId,
    );

    const response: ApiResponse<Consultation[]> = {
      success: true,
      data: history,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.get(
  "/api/consultation/:id",
  authenticateToken,
  (req: Request, res: Response) => {
    const consultation = consultations.get(req.params.id);

    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, error: "Consultation not found" });
    }

    const response: ApiResponse<Consultation> = {
      success: true,
      data: consultation,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.post(
  "/api/consultation/:id/feedback",
  authenticateToken,
  (req: Request, res: Response) => {
    const { rating } = req.body;
    const consultation = consultations.get(req.params.id);

    if (!consultation) {
      return res
        .status(404)
        .json({ success: false, error: "Consultation not found" });
    }

    consultation.updated_at = new Date();
    consultations.set(req.params.id, consultation);

    const response: ApiResponse<any> = {
      success: true,
      data: { message: "Feedback recorded", rating },
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== Content Management Routes ====================
app.post(
  "/api/content/knowledge",
  authenticateToken,
  authorizeRole(["admin", "teacher"]),
  (req: Request, res: Response) => {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, error: "Title and content required" });
    }

    const id = `knowledge_${Date.now()}`;
    const knowledge = {
      id,
      title,
      content,
      category: category || "general",
      created_by: "system",
      created_at: new Date(),
      updated_at: new Date(),
    };

    knowledgeBase.set(id, knowledge);

    const response: ApiResponse<any> = {
      success: true,
      data: knowledge,
      timestamp: new Date(),
    };

    res.status(201).json(response);
  },
);

app.get("/api/content/knowledge", (req: Request, res: Response) => {
  const knowledge = Array.from(knowledgeBase.values());

  const response: ApiResponse<any[]> = {
    success: true,
    data: knowledge,
    timestamp: new Date(),
  };

  res.json(response);
});

app.put(
  "/api/content/knowledge/:id",
  authenticateToken,
  authorizeRole(["admin", "teacher"]),
  (req: Request, res: Response) => {
    const knowledge = knowledgeBase.get(req.params.id);

    if (!knowledge) {
      return res
        .status(404)
        .json({ success: false, error: "Knowledge not found" });
    }

    const updated = { ...knowledge, ...req.body, updated_at: new Date() };
    knowledgeBase.set(req.params.id, updated);

    const response: ApiResponse<any> = {
      success: true,
      data: updated,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.delete(
  "/api/content/knowledge/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    knowledgeBase.delete(req.params.id);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== Analytics Routes ====================
app.get(
  "/api/analytics/dashboard",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const totalUsers = users.size;
    const activeUsers = Array.from(users.values()).filter(
      (u: any) => u.status === "active",
    ).length;
    const totalConsultations = consultations.size;

    const analytics = {
      total_users: totalUsers,
      active_users: activeUsers,
      new_users_today: Math.floor(Math.random() * 10),
      total_consultations: totalConsultations,
      average_response_time: 1.2,
    };

    const response: ApiResponse<any> = {
      success: true,
      data: analytics,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.get(
  "/api/analytics/user-progress/:id",
  authenticateToken,
  (req: Request, res: Response) => {
    const profile = studentProfiles.get(req.params.id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }

    const progress: StudentProgress = {
      student_id: req.params.id,
      total_questions_asked: profile.total_questions,
      avg_satisfaction: Math.random() * 5,
      learning_time_hours: profile.total_study_time,
      last_consultation_date: new Date(),
      progress_percentage: Math.min(100, (profile.total_questions / 50) * 100),
    };

    const response: ApiResponse<StudentProgress> = {
      success: true,
      data: progress,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

app.get(
  "/api/analytics/ai-performance",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const performance = {
      total_queries: consultations.size,
      average_satisfaction: 4.2,
      response_time_ms: 1200,
      success_rate: 0.95,
    };

    const response: ApiResponse<any> = {
      success: true,
      data: performance,
      timestamp: new Date(),
    };

    res.json(response);
  },
);

// ==================== AI Configuration Routes ====================
app.post(
  "/api/ai/config",
  authenticateToken,
  authorizeRole(["admin"]),
  (req: Request, res: Response) => {
    const { model_name, temperature, max_tokens, system_prompt } = req.body;

    const config = {
      id: `config_${Date.now()}`,
      model_name: model_name || "gpt-3.5-turbo",
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2000,
      system_prompt: system_prompt || "You are a helpful learning assistant.",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const response: ApiResponse<any> = {
      success: true,
      data: config,
      timestamp: new Date(),
    };

    res.status(201).json(response);
  },
);

app.get("/api/ai/config", (req: Request, res: Response) => {
  const config = {
    id: "config_default",
    model_name: "gpt-3.5-turbo",
    temperature: 0.7,
    max_tokens: 2000,
    system_prompt: "You are a helpful learning assistant.",
    created_at: new Date(),
    updated_at: new Date(),
  };

  const response: ApiResponse<any> = {
    success: true,
    data: config,
    timestamp: new Date(),
  };

  res.json(response);
});

// ==================== Health Check ====================
app.get("/api/health", (req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: true,
    data: null,
    timestamp: new Date(),
  };
  res.json(response);
});

// ==================== WebSocket for Real-time Consultation ====================
io.on("connection", (socket: Socket) => {
  console.log(`[WebSocket] User connected: ${socket.id}`);

  socket.on(
    "consultation:connect",
    (data: { userId: string; token: string }) => {
      console.log(`[Consultation] User ${data.userId} connected`);
      socket.emit("consultation:ready", { status: "ready" });
    },
  );

  socket.on(
    "consultation:message",
    (data: { userId: string; message: string }) => {
      console.log(`[Consultation] Message: ${data.message}`);
      const response = {
        id: `response_${Date.now()}`,
        message: "AI response to your question.",
        timestamp: new Date(),
      };
      socket.emit("consultation:response", response);
    },
  );

  socket.on("disconnect", () => {
    console.log(`[WebSocket] User disconnected: ${socket.id}`);
  });
});

// ==================== Error Handling ====================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Error]", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date(),
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(
    `[Environment] NODE_ENV=${process.env.NODE_ENV || "development"}`,
  );
});
