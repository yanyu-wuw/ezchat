# AI 学习辅导平台 - 项目改造方案

## 项目概述

将 EzChat 从简单的聊天应用升级为**企业级 AI 学习辅导平台**，设计包含管理端和学生端，提供真实后端接口支持。

### 核心定位

- **面向用户**: 学生、教师、平台管理员
- **核心功能**: AI 辅导咨询、学习进度追踪、知识管理、数据分析
- **技术栈**: React 19 + Express + Socket.io + PostgreSQL
- **API规模**: 20+ RESTful 接口

---

## 架构设计

### 项目结构

```
ezchat/
├── apps/
│   ├── web/                    # 前端应用
│   │   ├── src/
│   │   │   ├── layouts/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   └── StudentLayout.tsx
│   │   │   ├── pages/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── UserManagement.tsx
│   │   │   │   │   ├── ContentManagement.tsx
│   │   │   │   │   ├── Analytics.tsx
│   │   │   │   │   └── AIModelConfig.tsx
│   │   │   │   ├── student/
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── AIConsultation.tsx
│   │   │   │   │   ├── LearningHistory.tsx
│   │   │   │   │   └── Progress.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   └── LoginPage.tsx
│   │   │   │   └── NotFound.tsx
│   │   │   ├── components/
│   │   │   │   ├── AIChat.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── Chart.tsx
│   │   │   │   ├── FormInput.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useAI.ts
│   │   │   │   └── useFetch.ts
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── ai.ts
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts
│   │   │   │   └── userStore.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │
│   └── server/                 # 后端应用
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── users.ts
│       │   │   ├── content.ts
│       │   │   ├── ai.ts
│       │   │   ├── analytics.ts
│       │   │   └── consultation.ts
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── middleware/
│       │   ├── utils/
│       │   ├── db/
│       │   └── index.ts
│       └── package.json
│
└── packages/
    └── types/
        ├── auth.ts
        ├── user.ts
        ├── content.ts
        ├── ai.ts
        └── index.ts
```

---

## 后端 API 接口设计（20+ 接口）

### 认证模块（4接口）

- POST `/api/auth/register` - 注册用户
- POST `/api/auth/login` - 登录
- POST `/api/auth/logout` - 登出
- POST `/api/auth/refresh` - 刷新 Token

### 用户管理（5接口）

- GET `/api/users` - 获取用户列表（管理端）
- GET `/api/users/:id` - 获取用户详情
- PUT `/api/users/:id` - 更新用户信息
- DELETE `/api/users/:id` - 删除用户（管理员）
- GET `/api/users/:id/profile` - 获取学生档案

### 学习咨询（5接口）

- POST `/api/consultation/ask` - 提交咨询问题
- GET `/api/consultation/history` - 获取咨询历史
- GET `/api/consultation/:id` - 获取单条咨询详情
- POST `/api/consultation/:id/feedback` - 反馈咨询质量
- WebSocket `/ws/consultation` - 实时 AI 对话

### 内容管理（4接口）

- POST `/api/content/knowledge` - 创建知识内容（管理员）
- GET `/api/content/knowledge` - 获取知识库列表
- PUT `/api/content/knowledge/:id` - 更新内容（管理员）
- DELETE `/api/content/knowledge/:id` - 删除内容（管理员）

### 数据分析（3接口）

- GET `/api/analytics/dashboard` - 获取仪表板数据
- GET `/api/analytics/user-progress/:id` - 获取学生学习进度
- GET `/api/analytics/ai-performance` - AI 咨询效果分析

### AI 模型（2接口）

- POST `/api/ai/config` - 配置 AI 模型参数（管理员）
- GET `/api/ai/config` - 获取 AI 配置

---

## 功能模块

### 管理端（Admin Portal）

#### 1. 仪表板（Dashboard）

- 用户统计：总用户数、活跃用户、新注册数
- 咨询统计：总咨询数、待处理、已解决
- 平台指标：系统状态、API 调用频率、错误率

#### 2. 用户管理（User Management）

- 表格展示所有用户
- 搜索、筛选、分页
- 批量操作：启用/禁用、导出数据
- 每个用户的详细档案

#### 3. 内容管理（Content Management）

- 知识库CRUD操作
- 分类管理
- 编辑器支持富文本
- 发布控制和预览

#### 4. 咨询记录（Consultation Records）

- 查看所有学生咨询
- 标记为已审核
- 搜索和过滤
- 批量标记操作

#### 5. AI 模型管理（AI Model Config）

- 调整 AI 响应风格
- 设置知识库权重
- 测试 AI 回复
- 查看模型版本和日志

### 学生端（Student Portal）

#### 1. 仪表板（Dashboard）

- 学习统计：已学课程、学习进度、累计时长
- 最近查询
- 建议学习内容

#### 2. AI 咨询（AI Consultation）

- 实时聊天界面
- 问题输入和智能补全
- 回复展示和高亮
- 收藏/分享功能

#### 3. 学习记录（Learning History）

- 咨询历史列表
- 每条都可查看详情
- 标记学习进度
- 收藏重要问题

#### 4. 进度追踪（Learning Progress）

- 学习时间线
- 进度百分比
- 掌握知识点统计
- 个人学习报告

---

## UI 设计原则

1. **简洁明了** - 去除所有图标表情符号，使用纯文字和简单几何
2. **数据优先** - 前置关键信息，表格清晰有序
3. **高效导航** - 侧边栏导航，面包屑路由
4. **一致性** - 统一的色彩方案、间距、字体
5. **响应式** - 支持 1024px 以上的屏幕

---

## 技术改造清单

### 前端改造

- [ ] 创建 Layout 组件（Admin 和 Student 分开）
- [ ] 实现路由系统（Role-based routing）
- [ ] 创建 API 服务层
- [ ] 实现认证流程（JWT）
- [ ] 建立 Zustand Store
- [ ] 创建数据表格组件
- [ ] 创建图表组件（使用 Recharts）
- [ ] 实现 AI 聊天界面

### 后端改造

- [ ] 重构项目为 Express Router 模式
- [ ] 添加数据库连接（PostgreSQL）
- [ ] 实现 JWT 认证中间件
- [ ] 创建 20+ API 接口
- [ ] 添加数据验证和错误处理
- [ ] 实现 WebSocket 实时通讯
- [ ] 添加日志系统
- [ ] 数据库迁移脚本

### 依赖更新

- [ ] 添加图表库：Recharts
- [ ] 添加表单验证：React Hook Form + Zod
- [ ] 添加数据库：pg
- [ ] 添加 JWT：jsonwebtoken
- [ ] 添加日期处理：dayjs

---

## 简历亮点

通过这个项目可以体现的能力：

1. **全栈开发** - React + Express + PostgreSQL
2. **企业级架构** - 模块化设计、角色权限分离
3. **API 设计** - 20+ 接口的完整后端系统
4. **实时通讯** - Socket.io 的生产级应用
5. **数据分析** - 可视化仪表板和业务指标
6. **AI 集成** - 与 AI 服务（OpenAI/Claude）的集成
7. **认证系统** - JWT 认证和角色管理
8. **代码质量** - TypeScript、测试、错误处理

---

## 预期效果

改造完成后，与 Xiaomi 商城项目对标的核心设计知识点：

| 知识点   | Xiaomi 商城       | AI 学习平台       |
| -------- | ----------------- | ----------------- |
| 双端架构 | C端用户/后台管理  | 学生端/管理端     |
| 数据展示 | 商品列表/统计分析 | 咨询历史/学习分析 |
| 权限控制 | 用户/管理员       | 学生/教师/管理员  |
| 实时功能 | 库存实时          | AI对话实时反馈    |
| API设计  | 20+ 接口          | 20+ 接口          |
| 数据库   | PostgreSQL        | PostgreSQL        |

---

## 开发阶段

1. **第一阶段**：项目重构 + 后端 API 开发
2. **第二阶段**：管理端开发
3. **第三阶段**：学生端开发
4. **第四阶段**：测试、部署、文档完善
