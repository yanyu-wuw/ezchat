# AI Learning Platform - 项目面试知识体系

## 核心面试问题与回答

### 第一模块：架构设计

#### Q1: 为什么采用 Monorepo 架构而不是多个独立仓库？

**答案要点**：

1. **代码共享**：packages/types 中的共享类型定义减少重复
2. **流程统一**：使用 Turbo 实现统一的构建、测试、部署流程
3. **版本管理**：统一的 package.json 和依赖版本，避免不兼容
4. **开发效率**：单一 Git 仓库，减少跨库的 PR 和 CI 成本
5. **原子提交**：前后端相关改动可以在一次提交中完成

**代码示例**：

```json
// pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

// turbo.json 统一配置
{
  "pipeline": {
    "dev": { "cache": false },
    "build": { "outputs": ["dist/**"], "cache": true },
    "type-check": { "cache": true }
  }
}
```

#### Q2: 双端架构（Admin + Student）如何实现权限隔离？

**答案要点**：

**前端层面（React Router）**：

```typescript
// App.tsx 中的路由隔离
{user?.role === 'admin' && (
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<UserManagement />} />
  </Route>
)}

{(user?.role === 'student' || 'teacher') && (
  <Route element={<StudentLayout />}>
    <Route path="/student/consultation" element={<AIConsultation />} />
    <Route path="/student/progress" element={<Progress />} />
  </Route>
)}
```

**后端层面（Express 中间件）**：

```typescript
// 认证中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user; // { userId, role }
    next();
  });
};

// 权限检查中间件
const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

// 使用示例
app.delete(
  "/api/users/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteUserHandler,
);
```

**数据隔离**：

- Admin 可以看到所有用户
- Student 只能访问自己的数据
- 后端每个查询都需要检查权限

#### Q3: 如何设计 20+ API 接口的版本管理和向后兼容？

**答案要点**：

1. **API 版本化**：`/api/v1/users`, `/api/v2/users`
2. **字段扩展不兼容**：新增必需字段需要新版本
3. **弃用策略**：`X-API-Version-Deprecated` 告知客户端
4. **向后兼容**：删除字段前保留两个版本
5. **测试覆盖**：集成测试确保版本间兼容性

```typescript
// Express 路由版本管理
const apiV1Router = require("./routes/v1");
const apiV2Router = require("./routes/v2");

app.use("/api/v1", apiV1Router);
app.use("/api/v2", apiV2Router);

// 每个版本可以有完全不同的逻辑
// v1: 简单的用户列表
// v2: 支持分页、过滤、排序
```

---

### 第二模块：认证与权限

#### Q4: JWT Token 如何防止被篡改和过期？

**答案要点**：

1. **签名验证**：JWT 使用 HS256 算法，只有持有密钥的服务器能生成有效 Token
2. **过期时间**：设置 `expiresIn`，过期后需要重新登录或使用 refresh token
3. **Refresh Token**：长期 Token 用于获取新的 Access Token，不直接使用

**代码示例**：

```typescript
// 生成 Token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  JWT_SECRET,
  { expiresIn: "1h" }, // 1小时过期
);

// 设置 Refresh Token（服务端存储）
const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
  expiresIn: "7d",
});

// 验证和刷新
app.post("/api/auth/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({ token: newAccessToken });
  });
});
```

#### Q5: 如何防止常见的安全漏洞（CORS, XSS, CSRF）？

**答案要点**：

1. **CORS（跨域资源共享）**：

```typescript
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
```

2. **XSS（跨站脚本）防护**：

```typescript
// 1. 不直接渲染 HTML
// 错误：<div dangerouslySetInnerHTML={{ __html: userContent }} />
// 正确：直接输出文本，React 自动转义
<div>{userContent}</div>

// 2. 使用 DOMPurify
import DOMPurify from 'dompurify';
<div>{DOMPurify.sanitize(userContent)}</div>
```

3. **CSRF（跨站请求伪造）防护**：

```typescript
// 1. SameSite Cookie
res.cookie("token", token, {
  httpOnly: true,
  sameSite: "Strict",
});

// 2. CSRF Token
const csrfToken = crypto.randomBytes(32).toString("hex");
// 验证：req.headers['x-csrf-token'] === csrfToken
```

---

### 第三模块：实时通讯

#### Q6: WebSocket 连接如何与 HTTP 认证协作？

**答案要点**：

1. **握手阶段**：通过 query parameter 或 header 传递 token
2. **验证**：在 socket 连接时验证 token
3. **自动重连**：连接断开时自动重连

**代码示例**：

```typescript
// 前端：连接时传递 Token
const socket = io("http://localhost:3000", {
  auth: { token: localStorage.getItem("token") },
});

// 后端：验证连接
io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      socket.disconnect();
      return;
    }
    socket.userId = decoded.userId;
    socket.role = decoded.role;
  });
});

// 实时事件处理
socket.on("consultation:message", (data) => {
  // socket.userId 已验证
  console.log(`User ${socket.userId} sent: ${data.message}`);
});
```

#### Q7: 如何处理 WebSocket 消息丢失和重复发送？

**答案要点**：

1. **消息 ID**：每条消息包含唯一 ID
2. **确认机制**：发送方等待接收方的 ACK
3. **去重**：接收方记录已处理的消息 ID
4. **重试机制**：未收到 ACK 时重新发送

```typescript
// Socket.io 的自动确认
socket.emit("consultation:message", { id: uuid(), text: question }, (ack) => {
  // ack 是服务器的确认
  console.log("Message received by server:", ack);
});

// 服务器端
socket.on("consultation:message", (data, callback) => {
  // 处理消息...
  // 发送确认
  callback({ status: "received", id: data.id });
});
```

---

### 第四模块：数据库设计

#### Q8: 如何设计学生学习进度表以支持高效查询？

**答案要点**：

1. **数据模型**：学生档案 + 咨询记录 + 进度快照
2. **索引优化**：在 student_id、created_at 上建索引
3. **读写分离**：实时数据库用于写，缓存用于读

```sql
-- 学生档案
CREATE TABLE student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  total_questions INT DEFAULT 0,
  total_study_time INT DEFAULT 0,
  last_consultation TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 咨询历史
CREATE TABLE consultations (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  question TEXT NOT NULL,
  ai_response TEXT,
  satisfaction_rating INT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- 索引优化查询
CREATE INDEX idx_consultations_student_created
  ON consultations(student_id, created_at DESC);

-- 快速统计查询
SELECT
  student_id,
  COUNT(*) as total_questions,
  AVG(satisfaction_rating) as avg_satisfaction
FROM consultations
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY student_id;
```

---

### 第五模块：性能优化

#### Q9: 如何优化 20+ API 接口的响应时间？

**答案要点**：

1. **数据库查询优化**：使用 JOIN 减少查询次数
2. **缓存策略**：Redis 缓存热数据
3. **分页**：大数据集分页返回
4. **异步处理**：耗时操作使用队列

```typescript
// 1. 使用 JOIN 减少查询
// 坏: 循环查询每个用户的档案
users.forEach((user) => {
  const profile = db.query(`SELECT * FROM profiles WHERE user_id = ${user.id}`);
});

// 好: 单次 JOIN 查询
const result = db.query(`
  SELECT u.*, p.total_questions, p.total_study_time
  FROM users u
  LEFT JOIN student_profiles p ON u.id = p.user_id
  WHERE u.role = 'student'
`);

// 2. Redis 缓存
import Redis from "redis";
const cache = Redis.createClient();

app.get("/api/analytics/dashboard", async (req, res) => {
  const cacheKey = "dashboard:metrics";
  const cached = await cache.get(cacheKey);

  if (cached) return res.json(JSON.parse(cached));

  const data = await expensiveQuery();
  // 缓存 5 分钟
  await cache.setex(cacheKey, 300, JSON.stringify(data));
  res.json(data);
});

// 3. 分页
app.get("/api/users", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const users = db.query(`
    SELECT * FROM users LIMIT ${limit} OFFSET ${offset}
  `);
  res.json({
    data: users,
    page,
    total: totalCount,
    pages: Math.ceil(totalCount / limit),
  });
});
```

#### Q10: 如何处理大并发量（10,000+ 同时在线）？

**答案要点**：

1. **连接池**：数据库连接复用
2. **负载均衡**：多个进程/服务器
3. **消息队列**：异步处理非关键操作
4. **监控告警**：及时发现瓶颈

```typescript
// 1. 数据库连接池
import { Pool } from "pg";
const pool = new Pool({
  max: 20, // 最多20个连接
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 2. Socket.io 集群
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient();
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// 3. 使用 Bull 队列处理异步任务
import Bull from "bull";
const emailQueue = new Bull("email");

// 生产者
emailQueue.add({ userId: 123 }, { delay: 5000 });

// 消费者
emailQueue.process(async (job) => {
  const { userId } = job.data;
  // 发送邮件...
});
```

---

### 第六模块：测试与部署

#### Q11: 如何为 20+ API 接口编写有效的测试？

**答案要点**：

1. **单元测试**：测试业务逻辑
2. **集成测试**：测试 API 完整流程
3. **E2E 测试**：测试用户场景

```typescript
// 使用 Jest 和 Supertest
import request from "supertest";
import app from "../app";

describe("Authentication API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
      username: "testuser",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@example.com");
  });

  it("should fail with duplicate email", async () => {
    // 先注册一个用户
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@test.com", password: "pass", username: "user1" });

    // 尝试注册相同邮箱
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@test.com", password: "pass", username: "user2" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("Authorization", () => {
  it("should not allow student to delete users", async () => {
    const tokenRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "student@test.com", password: "pass123" });

    const token = tokenRes.body.data.token;

    const res = await request(app)
      .delete("/api/users/123")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });
});
```

#### Q12: 如何使用 Docker 和 CI/CD 部署应用？

**答案要点**：

```dockerfile
# Dockerfile - 多阶段构建优化镜像大小
FROM node:18 AS builder
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:18
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/ai_learning
      JWT_SECRET: your-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: ai_learning
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```yaml
# GitHub Actions CI/CD
name: Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
```

---

## 与 Xiaomi 商城的对标

| 知识点   | AI Learning  | Xiaomi        |
| -------- | ------------ | ------------- |
| 权限系统 | RBAC (3角色) | RBAC (多角色) |
| 实时通讯 | Socket.io    | WebSocket     |
| API 数量 | 20+          | 20+           |
| 数据库   | PostgreSQL   | PostgreSQL    |
| 缓存策略 | Redis        | Redis         |
| 部署方式 | Docker/CI-CD | Docker/CI-CD  |
| 测试覆盖 | 单元+集成    | 单元+集成     |

---

## 面试自信要点

1. **架构理解深度**：能解释每个设计决策的权衡
2. **安全意识**：了解常见漏洞和防护方案
3. **性能思维**：知道从 10 用户扩展到 100 万用户的瓶颈
4. **实践经验**：有具体代码示例和实现细节
5. **持续学习**：提到测试、监控、文档等工程实践

---

## 常见追问及对策

**追问**: "如何处理 Token 泄露？"
**回答**: 使用 HttpOnly Cookie + HTTPS，设置短过期时间，添加 Token 黑名单机制

**追问**: "系统如何应对数据库宕机？"
**回答**: 使用主从复制、自动故障转移、缓存等，提前规划灾难恢复 (DR) 方案

**追问**: "大并发下如何保证数据一致性？"
**回答**: 使用数据库事务、乐观锁、分布式锁等，对于最终一致性的场景使用消息队列

**追问**: "如何监控API性能？"
**回答**: 使用 APM 工具（DataDog、New Relic），添加中间件记录响应时间、错误率、P99延迟
