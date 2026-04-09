import dotenv from "dotenv";

dotenv.config();

// 使用 Groq 免费 API
async function callGroqAPI(question: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.AI_MODEL || "mixtral-8x7b-32768";

  if (!apiKey) {
    console.warn("[AI] GROQ_API_KEY not configured, using mock response");
    return getMockResponse(question);
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI learning assistant. Provide clear, concise answers to help students learn.",
            },
            {
              role: "user",
              content: question,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("[AI] Groq API call failed:", error);
    return getFallbackResponse(question);
  }
}

// 备用方案：使用 HuggingFace 免费推理 API
async function callHuggingFaceAPI(question: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return getMockResponse(question);
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ inputs: question }),
      },
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.statusText}`);
    }

    const result: any = await response.json();
    return result[0]?.generated_text || getMockResponse(question);
  } catch (error) {
    console.error("[AI] HuggingFace API call failed:", error);
    return getFallbackResponse(question);
  }
}

// 谷歌 Gemini 免费 API
async function callGeminiAPI(question: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getMockResponse(question);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: question,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return (
      data.candidates[0]?.content?.parts[0]?.text || getMockResponse(question)
    );
  } catch (error) {
    console.error("[AI] Gemini API call failed:", error);
    return getFallbackResponse(question);
  }
}

// 本地作为备用（OpenAI 兼容接口）
async function callLocalLLM(question: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:8000/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "local-model",
        messages: [
          { role: "system", content: "You are a helpful learning assistant." },
          { role: "user", content: question },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error("Local LLM not available");
    }

    const data: any = await response.json();
    return data.choices[0]?.message?.content || getMockResponse(question);
  } catch (error) {
    console.error("[AI] Local LLM failed:", error);
    return getFallbackResponse(question);
  }
}

// 智能回复：自动选择可用的 AI 服务
export async function getAIResponse(question: string): Promise<string> {
  const aiEnabled = process.env.AI_ENABLED !== "false";

  if (!aiEnabled) {
    return getMockResponse(question);
  }

  // 按优先级尝试
  const responses = [
    { name: "Groq", fn: () => callGroqAPI(question) },
    { name: "Gemini", fn: () => callGeminiAPI(question) },
    { name: "HuggingFace", fn: () => callHuggingFaceAPI(question) },
    { name: "Local", fn: () => callLocalLLM(question) },
  ];

  for (const { name, fn } of responses) {
    try {
      const response = await Promise.race([
        fn(),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000),
        ),
      ]);
      console.log(`[AI] Success with ${name}`);
      return response;
    } catch (error) {
      console.warn(`[AI] ${name} failed, trying next...`);
    }
  }

  // 所有都失败，返回备用响应
  return getFallbackResponse(question);
}

// 模拟响应（用于演示）
function getMockResponse(question: string): string {
  const mockResponses: { [key: string]: string } = {
    math: "我来帮你解决这个数学问题。首先，我们需要理解问题的关键部分，然后一步步求解...",
    science: "这是一个很好的科学问题。根据现有的科学理论，我们知道...",
    coding: "编程问题的解决方案是这样的，你可以使用以下代码来实现...",
    writing: "写作建议：首先明确你的主题，建立一个清晰的框架，然后逐段展开...",
    default:
      "这是一个有趣的问题。让我从几个不同的角度来帮助你理解这个概念。首先，我们需要理解基础知识...",
  };

  const lowerQ = question.toLowerCase();
  for (const [key, response] of Object.entries(mockResponses)) {
    if (key !== "default" && lowerQ.includes(key)) {
      return response;
    }
  }

  return mockResponses.default;
}

// 备用响应
function getFallbackResponse(question: string): string {
  return `我正在处理您的问题：【${question}】\n\n由于 AI 服务暂时不可用，我提供了一个基础的回答。请稍后恢复时重新提问以获得更准确的 AI 生成回答。`;
}

// AI 配置管理
export async function getAIConfig() {
  return {
    model: process.env.AI_MODEL || "mixtral-8x7b-32768",
    provider: process.env.GROQ_API_KEY ? "groq" : "mock",
    temperature: 0.7,
    max_tokens: 1000,
    status: process.env.GROQ_API_KEY ? "active" : "mock",
  };
}

export async function updateAIConfig(config: any) {
  // 实现 AI 配置更新逻辑
  return {
    ...config,
    updated_at: new Date(),
  };
}
