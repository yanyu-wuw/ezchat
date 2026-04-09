# ⚡ 快速启动指南

## 📦 系统要求已满足

- ✅ Node.js 已安装
- ✅ pnpm 包管理器已配置
- ✅ Docker PostgreSQL 运行中 (xiaomi-postgres)
- ✅ 所有依赖已安装
- ✅ TypeScript 编译通过

## 🎯 30秒快速启动

### 步骤 1: 启动应用

```bash
cd d:\ezchat

# 同时启动前端和后端
pnpm dev

# 或者分别启动:
# 终端1: pnpm --filter @ezchat/server dev
# 终端2: pnpm --filter @ezchat/web dev
```

### 步骤 2: 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000/api
- 健康检查: http://localhost:3000/api/health

### 步骤 3: 测试登录

使用演示认证信息 (在登录页面显示):

**学生账户**:

- Email: student@test.com
- Password: pass123

**管理员账户**:

- Email: admin@test.com
- Password: pass123

## 🔑 可选: 配置 AI API 密钥

为了使用真实的 AI 服务，在 `apps/server/.env` 添加密钥:

```env
# 优先推荐 - Groq (最快且免费)
GROQ_API_KEY=gsk_...

# 或 Google Gemini
GOOGLE_GEMINI_API_KEY=AIzaSy...

# 或 HuggingFace
HUGGINGFACE_API_KEY=hf_...
```

> 没有 API 密钥? 应用会自动使用模拟 AI 响应，仍可完整测试所有功能

## 📊 验证集成

### 检查后端状态

```bash
curl http://localhost:3000/api/health
```

**预期响应**:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "ai": "mock",
    "timestamp": "2026-04-08T..."
  }
}
```

### 检查数据库

```bash
# 连接到 PostgreSQL
docker exec -it xiaomi-postgres psql -U postgres -d ai_learning -c "\dt"

# 查看所有表
\dt public.*
```

### 测试 AI 咨询 API

```bash
# 1. 获取登录 token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"pass123"}'

# 2. 使用 token 提问 (替换 YOUR_TOKEN)
curl -X POST http://localhost:3000/api/consultation/ask \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Machine Learning?"}'
```

## 🎨 前端功能概览

### 学生界面

- 📚 AI 咨询 - 实时和 AI 对话
- 📖 学习历史 - 查看之前的提问
- 📈 学习进度 - 追踪学习统计
- 📊 仪表板 - 总体概览

### 管理员界面

- 👥 用户管理 - 管理学生/教师
- 📚 内容管理 - 管理知识库
- 📊 数据分析 - 查看系统指标
- 🤖 AI 配置 - 调整 AI 模型参数

## 🔧 故障排除

### "数据库连接失败"

```bash
# 检查 Docker 容器状态
docker ps | grep postgres

# 如果容器未运行，启动它
docker start xiaomi-postgres

# 验证连接
docker exec xiaomi-postgres psql -U postgres -c "SELECT 1"
```

### "无法启动前端"

```bash
# 清除缓存
cd apps/web
rm -r node_modules .vite dist tsconfig.tsbuildinfo

# 重新安装
pnpm install

# 重新启动
pnpm dev
```

### "后端 API 无响应"

```bash
# 检查后端是否运行
curl http://localhost:3000/api/health

# 如果没有响应，检查端口占用
netstat -ano | findstr :3000

# 检查日志查看错误信息
```

## 📚 完整文档

- [完整集成说明](./INTEGRATION_COMPLETE.md)
- [架构文档](./ARCHITECTURE.md)
- [项目总结](./PROJECT_SUMMARY.md)
- [面试知识点](./INTERVIEW_KNOWLEDGE_SYSTEM.md)

## 🎓 学习路径

### Week 1: 功能探索

1. 注册新账户
2. 提问并获取 AI 回复
3. 查看咨询历史
4. 检查学习进度

### Week 2: 深入理解

1. 查看代码架构
   - `apps/server/src/index.ts` - API 端点
   - `apps/server/src/db.ts` - 数据库层
   - `apps/server/src/ai.ts` - AI 服务
   - `apps/web/src/App.tsx` - 前端路由

2. 理解认证流程
   - JWT 生成和验证
   - RBAC 权限检查
   - Token 过期处理

3. 学习 WebSocket 实时通信
   - Socket.io 连接
   - 事件处理
   - 消息传递

### Week 3: 扩展和优化

1. 添加新 AI 功能
2. 扩展数据库 schema
3. 优化性能
4. 添加测试覆盖

## 📞 需要帮助?

### 常见问题

**Q: AI 响应很慢**
A: 检查是否使用了本地 LLM。如果配置了 API 密钥，应该会很快。

**Q: 如何修改数据库?**
A: 编辑 `apps/server/src/db.ts` 的 `initDatabase()` 函数。

**Q: 如何添加新 API 端点?**
A: 在 `apps/server/src/index.ts` 中添加新的 `app.get()`/`app.post()` 等。

**Q: 如何部署到生产?**
A: 使用 `pnpm build` 构建，然后 Docker 部署。参考 `docker-compose.yml`。

---

**状态**: 🟢 生产就绪
**最后更新**: 2026-04-08
**支持**: Windows, Docker, Node.js 18+
