# EzChat - 模拟面试对话 (终极深度拷打)

## 场景一: 技术一面 (40分钟)

### 面试官开场

**面试官**: "你好,欢迎。我看到你的简历上有个EzChat项目,这是个实时聊天应用对吧?能简单介绍一下吗?"

**你的回答**:
"好的,EzChat是我开发的实时聊天应用。从零开始设计的完整系统,包括前端React应用和后端Express服务器。

架构上,用Socket.io实现WebSocket双向通信,支持用户即时消息、在线状态管理和打字指示功能。前端用React做状态管理,后端用Node.js处理连接和消息路由。

主要亮点是消息路由设计 - 支持直接消息和广播两种模式,同时处理用户上线/离线的状态同步。用Map数据结构存储活跃用户,保证快速查找。

这个项目让我深入理解了实时通信的本质、WebSocket连接管理和企业级架构设计。"

---

### 第一个深入问题

**面试官**: "说说Socket.io的事件系统,你是怎么设计的?为什么不直接用WebSocket?"

**你的回答**:
"好问题。我的事件设计采用了命名约定: `资源:动作` 的格式。比如:

- `user:join` - 用户加入
- `message:send` - 发送消息
- `message:receive` - 接收消息
- `typing:start` / `typing:stop` - 打字指示

这样做的好处是:

1. 清晰的语义 - 看名字就知道干什么
2. 易于扩展 - 添加新功能不会混乱
3. 便于调试 - 知道哪些事件在流转

至于为什么不直接用WebSocket,主要考虑:

1. **容错性**: Socket.io自动处理连接丢失,会自动降级到HTTP长轮询。生产环境网络不稳定,这很重要。

2. **事件系统**: 原生WebSocket只有send/onmessage,需要自己做消息解析和分发。Socket.io事件模型更高级。

3. **自动重连**: Socket.io内置指数退避重连,生产环境必需。

4. **Room和Namespace**: Socket.io提供房间抽象,方便群组消息,原生WebSocket需要自己实现选择性广播。

代价是性能开销略微增加,但在大多数应用中不是瓶颈。"

---

### 模块化追问

**面试官**: "那你的消息路由是怎么实现的?直接消息和广播的区别?"

**你的回答**:
"这是项目的核心逻辑。看我的实现:

```typescript
// 后端 message:send 处理器
socket.on("message:send", (data: { text: string; to?: string }) => {
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    sender: socket.data.username,
    senderId: socket.id,
    text: data.text,
    timestamp: new Date(),
    read: false,
  };

  if (data.to) {
    // 直接消息路径
    const recipient = Array.from(activeUsers.entries()).find(
      ([, s]) => s.data.username === data.to,
    );
    if (recipient) {
      recipient[1].emit("message:receive", message);
      socket.emit("message:sent", { ...message, status: "delivered" });
    }
  } else {
    // 广播路径
    io.emit("message:receive", message);
  }
});
```

设计要点:

1. **可选参数 `to`**:
   - 有值 -> 直接消息
   - 无值/undefined -> 广播

2. **用户查找**:
   - 活跃用户存在Map中
   - Array.from(...).find() 查找目标
   - 时间复杂度O(n),可以优化

3. **事件发送**:
   - 直接消息: 只emit给recipient的socket
   - 广播: io.emit() 到所有连接

4. **反馈机制**:
   - 发送方收到 'message:sent' 确认
   - 接收方收到 'message:receive'

设计的优缺点:

优点:

- 简洁清晰
- 支持两种消息模式
- 有状态反馈

缺点:

- 用户查找是线性搜索
- 如果接收者离线,消息丢失
- 没有消息持久化

改进方案:

```typescript
// 用户名到socket的映射加速查找
const usernameIndex = new Map<string, string>(); // username -> socket.id

socket.on("user:join", () => {
  usernameIndex.set(socket.data.username, socket.id);
});

socket.on("disconnect", () => {
  usernameIndex.delete(socket.data.username);
});

// 查找优化到O(1)
const recipientId = usernameIndex.get(data.to);
const recipient = activeUsers.get(recipientId);
```

生产方案还要加:

- 消息队列 (离线消息)
- 数据库持久化
- 消息确认 (ack)
- 消息加密"

---

### 状态管理追问

**面试官**: "React那边怎么管理这些消息和用户状态的?为什么都放在App.tsx?"

**你的回答**:
"好的,讲讲前端架构。App.tsx是状态容器,管理整个应用的状态:

```typescript
// App.tsx
export default function App() {
  // 认证状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Socket连接
  const [socket, setSocket] = useState<Socket | null>(null);

  // 消息列表
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 用户列表
  const [users, setUsers] = useState<User[]>([]);

  // UI状态
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [typingStatus, setTypingStatus] = useState<string>("");

  // Socket生命周期
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;

    const newSocket = io(SOCKET_URL);

    // 事件监听
    newSocket.on("message:receive", handleMessageReceive);
    newSocket.on("users:update", handleUsersUpdate);
    newSocket.on("typing:indicator", handleTyping);

    // 发送加入事件
    newSocket.emit("user:join", currentUser);

    setSocket(newSocket);

    return () => newSocket.disconnect(); // 清理
  }, [isLoggedIn, currentUser]);
}
```

**为什么都放App.tsx?**

1. **单一真实来源 (SSOT)**
   - 集中管理,避免状态不一致
   - 如果分散在各组件,消息状态可能冲突

2. **简单方案**
   - 项目规模不大,10来个状态可以接受
   - Props传递虽然有点冗长,但清晰可追踪

3. **Prop Drilling的权衡**
   - ChatWindow需要messages、currentUser等
   - UserList需要users、selectedUser
   - LoginForm需要onLogin回调
   - 层级不深(App -> Component),还能接受

**什么时候需要升级?**

当有这些需求时:

- 状态超过20+个
- 3层以上的组件嵌套
- 多个无关组件需要共享状态
- 需要时间旅行调试 (DevTools)

升级方案:

```typescript
// 1. React Context (轻量级)
const ChatContext = createContext();

<ChatProvider>
  <App />
</ChatProvider>

// 2. Redux (重量级)
const store = createStore(rootReducer);
通过useSelector、useDispatch访问状态

// 3. Zustand (现代推荐)
const useChatStore = create((set) => ({
  messages: [],
  addMessage: (msg) => set(state => ({
    messages: [...state.messages, msg]
  }))
}));
```

**当前架构的优点:**

- 数据流清晰可追踪
- 调试简单 (React DevTools)
- 新手友好
- 没有学习曲线 (Context/Redux)

**缺点:**

- Props传递链长时感觉啰嗦
- 无法时间旅行调试
- 坑: 状态更新时整个App可能重新渲染

**优化tips:**

````typescript
// 1. 使用useCallback避免不必要的函数创建
const handleSend = useCallback((text: string) => {
  socket?.emit('message:send', {text});
}, [socket]);

// 2. 使用useMemo缓存计算结果
const filteredMessages = useMemo(() =>
  messages.filter(msg =>
    (msg.senderId === currentUser?.id && msg.sender === selectedUser?.username) ||
    (msg.sender === selectedUser?.username && msg.senderId !== currentUser?.id)
  ),
  [messages, currentUser, selectedUser]
);

// 3. 对子组件用React.memo避免重新渲染
const ChatWindow = React.memo(function ChatWindow({...props}) {
  // ...
});
```"

---

### 实战问题: Bug定位

**面试官**: "假设用户A和B聊天,用户A发的消息用户B收不到。你怎么排查?"

**你的回答**:
"好问题,这是实际生产会遇到的。我的排查流程:

**第1步: 验证基础连接**
````

1. 打开浏览器DevTools -> Network -> WS
2. 看Socket连接是否established
3. 查看连接参数(URL、headers)
4. 看是否有连接错误或关闭

````

**第2步: 追踪事件流**
```javascript
// 前端 - 发送端日志
socket.on('connect', () => console.log('Connected'));
socket.emit('message:send', {text: 'hello', to: 'UserB'});
socket.on('message:sent', (data) => {
  console.log('✓ 消息已发送确认');
});

// 后端日志
socket.on('message:send', (data) => {
  console.log('1. Server收到:', data);

  const recipient = Array.from(activeUsers.entries()).find(
    ([, s]) => s.data.username === data.to
  );

  console.log('2. 查找recipient:', data.to);
  console.log('3. 找到:', !!recipient);
  if (!recipient) {
    console.log('   活跃用户:', Array.from(activeUsers.values())
      .map(s => s.data.username));
  }
});
````

**第3步: 常见原因排查**

| 现象               | 原因            | 解决                       |
| ------------------ | --------------- | -------------------------- |
| 连接显示connecting | 网络不稳定      | 刷新页面/检查firewall      |
| 后端收不到消息     | 发送端代码bug   | 检查emit是否调用           |
| 找不到recipient    | 用户名拼写错    | 确认username准确           |
| 找到但没收到       | recipient已断线 | 重新连接                   |
| 收到别人的消息     | 消息过滤错误    | 检查ChatWindow的filter逻辑 |

**第4步: 添加监测**

```typescript
socket.on("message:send", async (data) => {
  const message = createMessage(data);

  // 保存到DB用于后续审计
  await db.messages.create({
    ...message,
    status: "sent",
    timestamp: new Date(),
  });

  if (data.to) {
    const recipient = findUser(data.to);
    if (!recipient) {
      // 关键:消息未送达应该有记录
      await db.failed_messages.create({
        message_id: message.id,
        reason: "recipient_not_found",
        timestamp: new Date(),
      });

      socket.emit("message:failed", {
        id: message.id,
        reason: "用户不在线",
      });
      return;
    }

    recipient.emit("message:receive", message);
  }
});

// 前端监听失败
socket.on("message:failed", (data) => {
  showNotification(`消息发送失败: ${data.reason}`);
});
```

**第5步: 如果还是找不到**

````
1. 查服务器日志 (cloudwatch/datadog)
2. 检查消息是否到达数据库
3. 是否有代理/firewall规则问题
4. 测试其他用户,排除个例
5. 回滚最近的代码变更
```"

---

### 性能和扩展

**面试官**: "现在假设用户从10个扩到10万个,系统会有什么瓶颈?怎么解决?"

**你的回答**:
"这是架构设计的关键问题。10万并发用户我要解决:

**问题1: 单服务器内存爆炸**
````

当前: activeUsers = Map<string, Socket>
假设每个Socket占10KB内存
100,000用户 × 10KB = 1GB
这还不包括消息缓存

解决: Redis做分布式registry

```javascript
// 用Redis代替本地Map
import redis from "redis";
const redisClient = redis.createClient();

socket.on("user:join", async (userData) => {
  await redisClient.set(
    `user:${socket.id}`,
    JSON.stringify({ ...userData, socketId: socket.id }),
    "EX",
    3600, // 1小时过期
  );
});

socket.on("disconnect", async () => {
  await redisClient.del(`user:${socket.id}`);
});

// 查询用户
const findUser = async (username) => {
  const keys = await redisClient.keys("user:*");
  for (let key of keys) {
    const user = JSON.parse(await redisClient.get(key));
    if (user.username === username) return user;
  }
};
```

**问题2: 单个服务器CPU无法处理10万连接**

```
解决: 负载均衡 + 多服务器

              ┌─ Server 1 (3000)
Nginx LB ────┼─ Server 2 (3001)
 (sticky)    ├─ Server 3 (3002)
              └─ Server 4 (3003)

关键: sticky session (同一client总是路由到同一server)
否则用户连接会跳转,状态丢失
```

**问题3: 多服务器间消息路由**

```
解决: Socket.io Redis adapter

const io = require('socket.io')(server);
io.adapter(require('socket.io-redis')({
  host: 'redis.example.com',
  port: 6379
}));

// 现在io.emit() 会通过Redis发到所有server的所有client
```

**问题4: 消息队列堆积**

```
假设每用户平均10msg/min
100,000用户 = 1,000,000 msg/min

解决: 消息队列分离

Message Flow:
User A ──emit──> Server ──push──> RabbitMQ ──consume──> Worker ──persist──> DB
                                        │
                                        └────> redis缓存最近消息
```

**问题5: 消息持久化**

```
不能再用内存,需要数据库

// PostgreSQL with indexing
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID,
  recipient_id UUID,
  text TEXT,
  created_at TIMESTAMP,
  read BOOLEAN DEFAULT false,
  INDEX (sender_id, recipient_id),
  INDEX (created_at DESC)
);

// 消息查询优化
SELECT * FROM messages
WHERE (sender_id = $1 AND recipient_id = $2)
   OR (sender_id = $2 AND recipient_id = $1)
ORDER BY created_at DESC
LIMIT 50;
```

**问题6: 打字指示器洪泛**

```
10万用户
如果每个人平均每5秒发一次'typing:start'
= 20,000 events/sec

解决: 限制broadcast范围

// 不: io.emit('typing:indicator') -> 所有10万用户
// 是: 只发给conversation对方

socket.on('typing:start', (data) => {
  if (data.to) {
    const recipientId = usernameIndex.get(data.to);
    io.to(recipientId).emit('typing:indicator', {...});
  }
});
```

**分层架构(100万用户规划):**

````
┌──────────────────────────────────────────┐
│         Frontend (Web/Mobile/App)        │
└────────────────┬─────────────────────────┘
                 │ WebSocket
        ┌────────▼────────┐
        │  Nginx Upstream │ (分发)
        │  Load Balancer  │
        └────────┬────────┘
   _____|_________|_________
  /     │         │         \
Socket  Socket  Socket  Socket
Server  Server  Server  Server
:3001   :3002   :3003   :3004
  \     │         │         /
   └────┴────┬────┴────────┘
        ┌─────▼──────┐
        │ Redis Pub/Sub
        │ (Message Bus)
        └─────┬──────┘
        ┌─────▼──────────┐
        │  Message Queue
        │  (RabbitMQ)
        └─────┬──────────┘
   ___________|___________
  /     │          │      \
Msg    Msg      Msg    Analytics
Worker Worker Worker    Worker
  \     │          │      /
   └────┴────┬─────┴─────┘
        ┌─────▼──────────┐
        │  PostgreSQL    │
        │  (Messages)    │
        └────────────────┘
```"

---

### 总结性深问

**面试官**: "如果让你重新设计这项目,现在会怎样?"

**你的回答**:
"基于实现过程的经验,我会:

**架构层面:**
1. 一开始就加入数据库(PostgreSQL),不依赖内存
2. 设计消息队列架构,用Redis做消息Broker
3. 前端加状态管理库(Redux/Zustand),避免Props Drilling
4. 后端分服务 (API Service、WebSocket Service、Worker Service)
5. 实现完整的认证系统(JWT),不是简单的username

**功能层面:**
1. 消息持久化 + 历史查询
2. 消息加密 (端到端或传输层)
3. 消息确认机制 (ack/nack)
4. 富文本消息(markdown、emoji支持)
5. 文件上传共享
6. 群组/频道支持

**质量层面:**
1. 完整的单元测试 (Jest)
2. 集成测试 (Socket.io事件)
3. 压力测试 (Apache JMeter)
4. 错误监控 (Sentry)
5. 性能监控 (New Relic)
6. 日志系统 (ELK stack)

**运维层面:**
1. Docker容器化
2. Kubernetes编排
3. CI/CD流程
4. 灰度发布策略
5. 灾难恢复计划

**但是**, 对于原始项目的目的(学习实时通信),当前设计已经很好了。架构选择要平衡复杂度和学习价值。"

---

## 场景二: 系统设计面试 (45分钟)

**面试官**: "设计一个支持1000万用户的企业级聊天系统,要求:
- 消息延迟<100ms
- 消息可靠性99.99%
- 支持群组(最大10万人群)
- 支持消息搜索
- 可以水平扩展

画个架构图出来。"

**你的回答**:
"这是个复杂的系统设计问题。让我分层思考:

**第一层: 客户端**
- Web/iOS/Android通过WebSocket连接
- 本地缓存最近消息(减少服务器查询)
- 自动重连机制

**第二层: API网关**
- Nginx/Envoy做路由和负载均衡
- 限流控制(防止DDoS)
- 请求签名验证

**第三层: WebSocket服务**
- 多个无状态Socket服务器
- 通过Redis Pub/Sub广播
- Session存储在Redis

**第四层: 业务逻辑服务**
- 消息服务(verify、encrypt)
- 用户服务(profile、relation)
- 群组服务(member管理)

**第五层: 存储**
- PostgreSQL + 分片(messenger表按user_id分片)
- Redis缓存热数据
- Elasticsearch做全文搜索

**第六层: 消息队列**
- Kafka存储所有消息流
- 用于消息重放、备份、分析

架构图:
````

┌─────────────────────────────────────────────────┐
│ Clients (Web/Mobile/App) │
└─────────────────┬───────────────────────────────┘
│
┌─────────▼──────────┐
│ API Gateway │
│ (Nginx/Envoy) │
│ Load Balancer │
└─────────┬──────────┘
\_**\_|**\_\_****|**\_\_\_\_**|\_\_\_\_
/ │ │ │ \
WebSocket WebSocket WebSocket
Service 1 Service 2 Service N
| | |
└────┬────┴────┬────┘
│ │ │
┌──▼────▼────▼──┐
│ Redis Pub/Sub│ (实时消息分发)
│ Session Store│ (用户session)
│ Cache Layer │ (消息缓存)
└──┬────┬────┬──┘
│ │ │
┌──▼────▼────▼──────────────┐
│ Service Mesh (Istio) │
│ - Message Service │
│ - User Service │
│ - Group Service │
│ - Search Service │
└──┬─────┬────────────────┬──┘
│ │ │
┌──────▼──┐┌─▼────────┐ ┌────▼──────────┐
│ Postgres││ Kafka │ │Elasticsearch │
│ Shards ││ Message │ │ (Fulltext │
│ ││ Queue │ │ Search) │
└──────────┘└─────────┘ └───────────────┘

Monitoring:
├─ Prometheus (metrics)
├─ Grafana (visualization)
├─ Jaeger (tracing)
└─ ELK (logging)

```

**关键设计点:**

1. **消息延迟<100ms**
   - 将WebSocket和应用逻辑分离
   - Socket服务只处理连接和转发
   - 消息验证异步进行

2. **消息可靠性99.99%**
   - 消息三副本存储(Kafka)
   - 端到端确认 (ack机制)
   - 死信队列处理失败消息

3. **群组支持1万人**
   - 不向每个人单独发(N个emit)
   - 用Redis PubSub的channel
   - 成本O(1)而不是O(N)

4. **消息搜索**
   - 不在主库查询(会拖累性能)
   - 通过Kafka异步索引到Elasticsearch
   - 用户查询走Elasticsearch

5. **水平扩展**
   - 无状态WebSocket服务(可任意扩展)
   - 数据库分片(user_id hash)
   - 消息队列分片
   - 缓存分片(consistent hash)

6. **故障容错**
   - WebSocket服务故障: reconnect到另一个
   - 数据库故障: 主从切换
   - Kafka故障: 多副本保证持久性
   - 缓存故障: cache穿透处理"

---

## 场景三: 行为面试 (30分钟)

**面试官**: "讲讲这个项目中做得最好的决策是什么?"

**你的回答**:
"最好的决策是选择Socket.io而不是自己实现WebSocket。

这个决策看似简单,但其实深思熟虑。

一开始我考虑过直接用原生WebSocket,理由是:
- 性能略好(不用Socket.io的开销)
- 代码掌控度更高
- 学习价值(深入理解协议)

但我最终选了Socket.io,理由是:

1. **长期可维护性**: Socket.io处理的edge cases很多
   - 浏览器兼容性(不是所有环境都支持WebSocket)
   - 连接断线恢复
   - 自动序列化/反序列化
   - 内置重连机制

   这些如果自己实现,代码会膨胀3倍,bug也多3倍。

2. **开发速度**: 一周内完成原型很重要
   - 用Socket.io快速迭代
   - 而不是花时间debug协议细节

3. **生产就绪**: Socket.io已经在Slack、Uber等大公司用过
   - 经过千锤百炼
   - 性能optimization做过了
   - 开源社区活跃,问题有人解答

在一个创业项目,我会更看重:
- 交付速度
- 代码可维护性
- 有bug时社区是否能支持

而不是100%掌控的快感。

但是** - 如果是Google/Meta这样的公司,基础设施平台特别重要,我就会考虑自己实现,因为:
- 性能差1ms都有巨大商业价值
- 掌控度很重要
- 有专门团队维护

这体现了工程中的权衡 - 没有绝对的'最优'方案,只有在特定context下的合适选择。"

---

**面试官**: "遇到过技术选型错误的情况吗?怎么处理的?"

**你的回答**:
"有的。在考虑是否用TypeScript时,我初期想用原生JavaScript快速开发。

理由:
- 开发速度(不用写类型)
- 减少编译时间
- 快速学习Socket.io

但后来改成了TypeScript,因为:

1. **Bug发现更早**: 在开发期间而不是运行时
   - 写Server代码时,IDE告诉我message类型应该有text字段
   - 如果是JS,要到运行时才知道消息结构有问题

2. **团队协作**: 别人接手代码时更容易理解
   - 不用猜测message对象有哪些字段
   - IDE会自动提示

3. **重构安全**: 改掉某个类型的字段名,所有相关代码一眼看出
   - JS需要grep加手工检查,容易漏掉

虽然多花了30分钟写类型定义,但长期来说节省了debug时间。

这个决策让我明白 - **前期的'麻烦'往往是后期的'省事'**。

现在我的原则是:
- 团队<=2人: 用TypeScript会减少沟通成本
- 项目周期>3月: 一定要用TypeScript
- 核心业务逻辑: 100%用TypeScript
- 脚本工具: 可以考虑JavaScript"

---

## 场景四: 创意与前瞻性

**面试官**: "这个项目接下来的3个月怎么演进?有没有可能做成商业产品?"

**你的回答**:
"很好的问题。我确实想过这件事。

**阶段1 (Month 1-2): AI增强**
首先加入AI能力 - 情感分析、智能回复建议、实时翻译。

为什么这个优先级高?
- 用户体验明显提升
- 与市面产品(Slack)形成差异
- AI已成为商业产品标准配置

技术上我会:
- 集成OpenAI API做快速验证
- 不自己训练模型(成本高)
- 用微服务架构,AI逻辑隔离

预期效果:
- 用户粘性提升(更好用)
- 成为卖点(可以标榜'AI助手')

**阶段2 (Month 2-3): 商业基础功能**
- 用户认证和授权系统
- 组织/团队概念
- 消息存档(满足企业合规需求)
- 使用分析dashboard

这些对to-B销售很重要:
- IT管理员需要看谁说了啥(合规)
- 需要控制谁能访问谁(权限)
- CTO想看产品的价值(analytics)

**阶段3 (Month 4+): 商业化路线**
1. **To-B SaaS**
   - 目标: 10-100人的公司
   - 价格: $10/user/month
   - 竞对: Slack、Microsoft Teams
   - 优势: AI能力更强、轻量级、更便宜

2. **To-C应用**
   - 目标: 年轻人、互联网公司
   - 免费 + 高级功能付费
   - 竞对: Discord、Telegram、Line

3. **API平台**
   - 开放API给企业集成
   - 收取API调用费

**去商业化前的验证:**
1. 先找5个beta用户(免费)
   - 收集反馈
   - 看是否真的有人用

2. 做用户访谈(5个问题)
   - 他们现在用什么工具?
   - 痛点是什么?
   - 愿意付费吗?愿意付多少?
   - 什么功能最重要?
   - 谁是决策者?

3. 算商业模型
   - 获客成本(CAC) vs 客户生命周期价值(LTV)
   - LTV > 3×CAC 才有意义

**我的看法:**
这个项目**有可能做成产品**,但:
- 成功的关键是AI能力(必须比Slack好)
- 数据安全和隐私是to-B的核心卖点
- 初期目标应该是小而专(比如特定行业)
- 不要试图一开始就对标Slack

**如果只有我一个人:**
- 放弃to-B(需要销售和客服)
- 选择to-C方向(可以自己推广)
- 或者做垂直社区(比如'程序员聊天应用')
- 或者开源+社区(参考Discord早期)

**现在最想做的:**
把AI功能完整实现,然后找个大学同学一起创业。技术已经ready了,瓶颈是用户找和市场验证。"

---

## 最后的建议

这个模拟面试涵盖了:
✅ 技术深度(架构设计、技术选择)
✅ 系统设计(10万并发、消息队列)
✅ 问题解决(Bug定位、性能优化)
✅ 行为表现(决策权衡、错误处理)
✅ 前瞻性(产品演进、商业潜力)

**准备建议:**
1. 再读一遍ARCHITECTURE.md - 确保能流畅讲出架构
2. 在本地跑项目,调试Socket事件 - 深度理解flow
3. 想象自己是code reviewer - 会怎样重构?
4. 查OpenAI/Google的架构论文 - 了解industry best practice
5. 找朋友mock面试 - 不要只在脑子里想

祝面试顺利!
```
