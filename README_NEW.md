# AI Learning Platform

一个企业级全栈 AI 学习辅导平台，为学生提供实时 AI 咨询、学习进度追踪和数据分析功能。

## 项目特点

✅ **双门户架构**: 管理端 + 学生端完全分离
✅ **AI 咨询系统**: 实时问答和学习建议
✅ **数据分析**: 学习进度追踪和智能统计
✅ **企业级 API**: 20+ RESTful 接口支持
✅ **权限管理**: 基于角色的访问控制 (RBAC)
✅ **实时通讯**: WebSocket 实时对话支持

## 技术栈

### 前端

- **框架**: React 19 + TypeScript
- **构建**: Vite 5
- **路由**: React Router 6
- **状态管理**: Zustand
- **样式**: Tailwind CSS 3
- **包管理**: pnpm

### 后端

- **服务**: Express.js 4
- **实时**: Socket.io 4
- **认证**: JWT (jsonwebtoken)
- **密码**: bcryptjs
- **语言**: TypeScript 5

### 架构

- **Monorepo**: Turbo 2
- **共享类型**: packages/types
- **独立应用**: apps/server, apps/web

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境启动

```bash
pnpm dev
```

访问应用:

- 前端: http://localhost:5173
- 后端: http://localhost:3000

### 生产构建

```bash
pnpm build
pnpm start
```

---

## API 接口总览

### 认证 (4 接口)

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新令牌

### 用户管理 (5 接口)

- `GET /api/users` - 获取所有用户 (管理员)
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户 (管理员)
- `GET /api/users/:id/profile` - 获取学生档案

### 咨询服务 (5 接口)

- `POST /api/consultation/ask` - 提交咨询问题
- `GET /api/consultation/history` - 获取咨询历史
- `GET /api/consultation/:id` - 获取单条咨询
- `POST /api/consultation/:id/feedback` - 提交反馈
- `WebSocket /ws/consultation` - 实时对话

### 内容管理 (4 接口)

- `POST /api/content/knowledge` - 创建知识内容
- `GET /api/content/knowledge` - 获取知识库
- `PUT /api/content/knowledge/:id` - 更新内容
- `DELETE /api/content/knowledge/:id` - 删除内容

### 数据分析 (3 接口)

- `GET /api/analytics/dashboard` - 仪表板数据
- `GET /api/analytics/user-progress/:id` - 学生进度
- `GET /api/analytics/ai-performance` - AI 性能能

### AI 配置 (2 接口)

- `GET /api/ai/config` - 获取 AI 配置
- `POST /api/ai/config` - 更新 AI 配置

---

## 项目结构

```
ezchat/
├── apps/
│   ├── web/                  # React 前端应用
│   │   ├── src/
│   │   │   ├── pages/        # 页面组件
│   │   │   │   ├── admin/    # 管理功能
│   │   │   │   ├── student/  # 学生功能
│   │   │   │   └── auth/     # 认证页面
│   │   │   ├── components/   # 可复用组件
│   │   │   ├── layouts/      # 布局组件
│   │   │   ├── hooks/        # 自定义 Hooks
│   │   │   ├── services/     # API 服务
│   │   │   └── store/        # 状态管理
│   │   └── package.json
│   │
│   └── server/               # Express 后端应用
│       ├── src/
│       │   ├── routes/       # API 路由
│       │   ├── models/       # 数据模型
│       │   ├── middleware/   # 中间件
│       │   └── index.ts      # 应用入口
│       └── package.json
│
└── packages/
    └── types/                # 共享 TypeScript 类型定义
```

---

## 功能模块详解

### 管理端功能

#### 1. 仪表板 Dashboard

- 实时用户统计
- 咨询数据概览
- 平台健康状态
- 关键指标监测

#### 2. 用户管理 User Management

- 用户列表展示
- 搜索和筛选
- 用户状态管理
- 批量操作

#### 3. 内容管理 Content Management

- 知识库 CRUD
- 分类管理
- 富文本编辑
- 发布控制

#### 4. 数据分析 Analytics

- AI 效果分析
- 平台指标统计
- 学生学习数据
- 导出报表

#### 5. AI 模型配置

- 参数调整
- 响应风格自定义
- 知识库权重设置
- 模型版本管理

### 学生端功能

#### 1. 仪表板

- 个人学习统计
- 最近查询记录
- 学习建议推荐
- 进度总览

#### 2. AI 咨询

- 实时问答界面
- 智能问题补全
- 回复高亮显示
- 收藏与分享

#### 3. 学习历史

- 历史咨询查看
- 详情浏览
- 分类归档
- 重点收集

#### 4. 进度追踪

- 学习时间统计
- 知识点掌握度
- 个人学习报告
- 成就展示

---

## 用户角色

### Admin (管理员)

- 完全系统访问权限
- 用户和内容管理
- 数据分析和报告
- AI 模型配置

### Student (学生)

- 使用 AI 咨询
- 查看学习进度
- 浏览学习历史
- 管理个人文件

### Teacher (教师)

- 创建教学内容
- 查看学生进度
- 管理知识库
- 性能监控

---

## 测试账号

快速测试使用:

| 姓名   | 邮箱             | 密码    | 角色    |
| ------ | ---------------- | ------- | ------- |
| 学生   | student@test.com | pass123 | Student |
| 管理员 | admin@test.com   | pass123 | Admin   |

---

## 部署指南

### 本地部署

1. 克隆项目

```bash
git clone <url>
cd ezchat
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

```bash
# apps/server/.env
PORT=3000
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key
NODE_ENV=development
```

4. 启动开发服务

```bash
pnpm dev
```

### Docker 部署

```dockerfile
# 待补充
```

### 云部署

建议使用:

- 前端: Vercel, Netlify
- 后端: Railway, Heroku, AWS

---

## 环境要求

- Node.js >= 18
- pnpm >= 8
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

---

## 与简历对标

| 维度     | Xiaomi 商城   | AI Learning |
| -------- | ------------- | ----------- |
| 架构     | 电商双端      | 教育双端    |
| 页面数   | 15+           | 12+         |
| API 接口 | 20+           | 20+         |
| 数据库   | PostgreSQL    | PostgreSQL  |
| 实时功能 | WebSocket     | WebSocket   |
| 权限系统 | RBAC          | RBAC        |
| 认证方式 | JWT           | JWT         |
| 状态管理 | Redux/Zustand | Zustand     |

---

## 常见问题

**Q: 如何连接真实的 AI 服务?**
A: 在 `apps/server/src/index.ts` 的 `consultation:message` 处理器中集成 OpenAI/Claude API

**Q: 如何添加数据库?**
A: 在 `apps/server/package.json` 中添加 `pg` 包，在 `db/` 文件夹中创建连接和迁移脚本

**Q: 如何部署到生产环境?**
A: 使用 Docker + CI/CD 工具 (GitHub Actions, GitLab CI) 自动部署

---

##许可

MIT License - 查看 [LICENSE](./LICENSE) 文件

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 支持

如有问题，请提交 Issue 或联系开发团队。
