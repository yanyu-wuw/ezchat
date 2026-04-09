# EzChat - Interview Deep Dive Questions & Answers

## System Design & Architecture Questions

### Q1: Why did you choose Socket.io over WebSocket directly?

**Answer:**
Socket.io provides several advantages over raw WebSocket:

1. **Fallback Support**: Automatically falls back to HTTP long-polling, HTTP streaming, or JSONP polling if WebSocket isn't available
2. **Automatic Reconnection**: Built-in exponential backoff retry logic. Raw WebSocket doesn't have this
3. **Event System**: Named events instead of raw message handling - easier to manage multiple event types
4. **Rooms & Broadcasting**: Socket.io provides room abstraction for selective broadcasting
5. **Middleware Support**: Can add authentication, logging, etc. to socket connections

**Trade-off**: Socket.io adds some overhead (parsing, encoding) compared to raw WebSocket, but the features outweigh this for most applications.

**Code Example:**

```javascript
// Socket.io - clean event system
socket.emit("message:send", { text: "Hello" });
socket.on("message:receive", handleMessage);

// Raw WebSocket - manual parsing needed
ws.send(JSON.stringify({ type: "message", text: "Hello" }));
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "message") handleMessage(msg);
};
```

### Q2: How would you scale this application to handle 100,000 concurrent users?

**Answer:**
Current limitations and solutions:

1. **In-Memory User Storage**
   - Problem: All users in single server memory
   - Solution: Redis cluster for distributed user registry
   - Implementation: Use redis-io adapter

   ```javascript
   const io = require("socket.io")(server);
   io.adapter(
     require("socket.io-redis")({
       host: "redis-host",
       port: 6379,
     }),
   );
   ```

2. **Single Server Bottleneck**
   - Problem: Single Node.js server limited by CPU/memory
   - Solution: Load balancer + multiple server instances
   - Sticky sessions required (keep socket on same server)

3. **Database Queries**
   - Problem: No persistence layer
   - Solution: PostgreSQL with proper indexing
   - Use connection pooling (pg-boss)

4. **Horizontal Scaling Architecture:**

```
                    ┌─────────────┐
                    │ Load Balancer
                    │ (Sticky     │
                    │  Sessions)  │
                    └─────┬───────┘
                    _____|_____
                   /    |    \
              Socket  Socket  Socket
              Server  Server  Server
              Port    Port    Port
              3000    3001    3002
                   \   |    /
                    ┌──┴────┐
                    │ Redis  │ User registry
                    │ Cluster│ Message queue
                    └────────┘
                        │
                    ┌───┴────┐
                    │PostgreSQL
                    │ Cluster │
                    └────────┘
```

5. **Message Queue**
   - Problem: Message handling bottleneck
   - Solution: Redis pub/sub or Apache Kafka
   - Decouple message processing

6. **Caching Strategy**
   - Cache user profiles
   - Cache recent messages
   - Use Redis for quick lookups

### Q3: Explain the current message delivery flow and potential issues

**Answer:**
Current Flow:

```
Client A (ChatWindow)
    ↓
    emit("message:send", {text, to?})
    ↓
Server receives message:send
    ↓
If direct message:
    ├─ Find recipient in activeUsers Map
    ├─ If found: emit to recipient socket
    ├─ Emit "message:sent" status back to sender
    └─ If NOT found: silently fail (BUG)
    ↓
Recipient receives message:receive
    ↓
Update messages state
    ↓
ChatWindow re-renders with new message
```

**Issues & Solutions:**

1. **Silent Failure**: If recipient offline, message lost

   ```javascript
   // Current buggy code
   const recipient = Array.from(activeUsers.values()).find(
     (s) => s.data.username === data.to,
   );
   if (recipient) {
     recipient[1].emit("message:receive", message);
   }
   // If recipient not found, nothing happens - user doesn't know

   // Solution: Add delivery status
   if (recipient) {
     recipient[1].emit("message:receive", message);
     socket.emit("message:status", { id: message.id, status: "delivered" });
   } else {
     socket.emit("message:status", { id: message.id, status: "failed" });
     // Store in queue for later delivery when user comes online
   }
   ```

2. **No Message Persistence**: Messages lost on refresh

   ```javascript
   // Solution: Save to database
   await db.messages.create({
     sender_id: user.id,
     recipient_id: recipient?.id,
     text: data.text,
     created_at: new Date(),
   });
   ```

3. **No Message History**: Can't retrieve old messages

   ```javascript
   // Solution: Add history endpoint
   app.get("/api/messages/:userId", async (req, res) => {
     const messages = await db.messages
       .where({
         $or: [
           { sender_id: req.user.id, recipient_id: userId },
           { sender_id: userId, recipient_id: req.user.id },
         ],
       })
       .orderBy("created_at", "desc")
       .limit(50);
     res.json(messages);
   });
   ```

4. **No Delivery Receipts**: Sender doesn't know if message delivered

   ```javascript
   // Solution: Implement read receipts
   socket.on("message:read", (data: {messageId: string}) => {
     io.emit("message:read", {messageId: data.messageId, readBy: socket.data.id});
   });
   ```

5. **Order Guarantee**: Messages could arrive out of order
   ```javascript
   // Solution: Use timestamps and sequence numbers
   const message = {
     id: crypto.randomUUID(),
     sequence: serverMessageCounter++,
     timestamp: Date.now(),
     sender: socket.data.username,
     text: data.text,
   };
   ```

### Q4: How would you implement message encryption?

**Answer:**
Implementation approach:

```javascript
// Frontend - Encrypt before sending
import crypto from "crypto";

function encryptMessage(message: string, publicKey: string): string {
  const encrypted = crypto.publicEncrypt(
    {key: publicKey},
    Buffer.from(message)
  );
  return encrypted.toString("base64");
}

// Server - Relay encrypted message (can't read)
socket.on("message:send", (data: {text: string, to: string}) => {
  // text is already encrypted
  const recipient = findUser(data.to);
  recipient?.emit("message:receive", {
    text: data.text, // encrypted
    sender: socket.data.username,
    timestamp: new Date()
  });
});

// Recipient - Decrypt after receiving
import crypto from "crypto";

function decryptMessage(encrypted: string, privateKey: string): string {
  const buffer = Buffer.from(encrypted, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString();
}
```

**Key Management:**

1. Generate RSA key pairs during user registration
2. Store public key on server
3. Keep private key only on client
4. Use key exchange protocol for first-time users

**But in practice:** Use established encryption libraries like libsodium/TweetNaCl

### Q5: How would you handle user authentication?

**Current State**: No real authentication - anyone can use any username

**Proper Implementation:**

```javascript
// Registration
app.post("/api/auth/register", async (req, res) => {
  const { username, password, email } = req.body;

  // Validate input
  if (!username || username.length < 3)
    return res.status(400).json({ error: "Invalid username" });
  if (!password || password.length < 8)
    return res.status(400).json({ error: "Weak password" });

  // Hash password (use bcrypt or argon2)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store in database
  const user = await db.users.create({
    username,
    email,
    password_hash: hashedPassword,
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({ token, user });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.users.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({ token, user });
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Protected route
app.get("/api/users", verifyToken, (req, res) => {
  // Only authenticated users can access
  const users = Array.from(activeUsers.values()).map((s) => s.data);
  res.json(users);
});

// Socket auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});
```

## Implementation & Problem Solving

### Q6: Walk me through adding a "typing indicator" feature

**Solution:**

1. **Plan the flow:**
   - When user starts typing → emit "typing:start"
   - Server receives and finds recipient
   - Server emits "typing:indicator" to recipient
   - Recipient shows "User is typing..." message
   - When user stops typing → emit "typing:stop"
   - After 2 seconds of inactivity → auto-clear

2. **Frontend Implementation:**

   ```typescript
   // ChatWindow.tsx
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setInputValue(e.target.value);

     if (e.target.value.trim()) {
       onTypingStart(); // emit to server
     } else {
       onTypingStop();
     }
   };

   // App.tsx
   const handleTypingStart = () => {
     socket?.emit("typing:start", { to: selectedUser?.username });

     // Set timeout to auto-stop after 3 seconds of inactivity
     clearTimeout(typingTimeout);
     typingTimeout = setTimeout(() => {
       socket?.emit("typing:stop", {});
     }, 3000);
   };

   // Listen for typing indicator
   socket.on("typing:indicator", (data: { username: string }) => {
     setTypingStatus(`${data.username} is typing...`);
     setTimeout(() => setTypingStatus(""), 2000);
   });
   ```

3. **Server Implementation:**

   ```typescript
   socket.on("typing:start", (data: { to?: string }) => {
     if (data.to) {
       // Direct typing indicator
       const recipient = Array.from(activeUsers.values()).find(
         (s) => s.data.username === data.to,
       );
       recipient?.emit("typing:indicator", {
         username: socket.data.username,
       });
     } else {
       // Broadcast typing
       socket.broadcast.emit("typing:indicator", {
         username: socket.data.username,
       });
     }
   });

   socket.on("typing:stop", () => {
     io.emit("typing:stop", { username: socket.data.username });
   });
   ```

4. **Edge cases:**
   - What if user closes browser? Manual emit "typing:stop"
   - What if network latency causes multiple typing starts? Timer handles it
   - What if user types very fast? Already handled by continuous updates

### Q7: How would you debug a message not being delivered?

**Debugging Strategy:**

1. **Check console logs:**
   - Frontend: `socket.emit("message:send", data)` - verify event fired
   - Server: `socket.on("message:send")` - verify received
   - Verify recipient found in activeUsers

2. **Add logging:**

   ```typescript
   // Server
   socket.on("message:send", (data) => {
     console.log("🔵 Message received from", socket.data.username);
     console.log("🔵 Content:", data.text);
     console.log("🔵 To:", data.to);

     const recipient = Array.from(activeUsers.values()).find(
       (s) => s.data.username === data.to,
     );
     console.log("🔵 Recipient found:", !!recipient);

     if (!recipient) {
       console.warn("❌ Recipient not in activeUsers");
       console.warn(
         "❌ Available users:",
         Array.from(activeUsers.values()).map((s) => s.data.username),
       );
     }
   });
   ```

3. **Use Socket.io DevTools:**
   - Browser extension shows all socket events
   - See event payload in real-time

4. **Check network tab:**
   - Verify WebSocket connection established
   - See actual message being sent

5. **Common causes:**
   - Recipient username misspelled
   - Recipient disconnected
   - Wrong recipient object accessed (socket vs user data)
   - Filter logic in ChatWindow filtering out message

## React & Performance Questions

### Q8: How would you optimize rendering performance?

**Current Performance Issues:**

1. All messages in single array (grows unbounded)
2. ChatWindow re-renders on every message
3. UserList re-renders when any user joins/leaves

**Optimizations:**

```typescript
// 1. Use React.memo for UserList items
const UserListItem = React.memo(({user, selected, onSelect}) => (
  <div onClick={() => onSelect(user)}>
    {user.username}
  </div>
), (prevProps, nextProps) => {
  // Only re-render if user data changed
  return prevProps.user.id === nextProps.user.id &&
         prevProps.selected === nextProps.selected;
});

// 2. Virtualization for message list (only render visible messages)
import { FixedSizeList } from "react-window";

const MessageList = ({messages}) => (
  <FixedSizeList
    height={600}
    itemCount={messages.length}
    itemSize={80}
  >
    {({index, style}) => (
      <div style={style}>
        {messages[index]}
      </div>
    )}
  </FixedSizeList>
);

// 3. Pagination
const MESSAGES_PER_PAGE = 50;
const [page, setPage] = useState(0);
const visibleMessages = messages.slice(0, (page + 1) * MESSAGES_PER_PAGE);
```

### Q9: Explain the React lifecycle for socket in this app

**Answer:**

```typescript
// Mount phase
useEffect(() => {
  // Dependency: [isLoggedIn, currentUser]
  // Runs when these change

  if (!isLoggedIn || !currentUser) {
    return; // Early exit if not logged in
  }

  // Create socket connection
  const newSocket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
  });

  // Connection established
  newSocket.on("connect", () => {
    console.log("Connected to server");
    newSocket.emit("user:join", currentUser);
  });

  // Listen for events
  newSocket.on("message:receive", (message) => {
    setMessages((prev) => [...prev, message]);
  });

  newSocket.on("users:update", (users) => {
    setUsers(users.filter((u) => u.id !== currentUser.id));
  });

  // Store socket
  setSocket(newSocket);

  // Cleanup on unmount or dependency change
  return () => {
    console.log("Disconnecting socket");
    newSocket.disconnect();
  };
}, [isLoggedIn, currentUser]);
```

**Dependency Array Matters:**

- `[]` - Run once on mount
- `[dependency]` - Run when dependency changes
- No array - Run on every render (infinite loops!)

**Memory Leaks to Avoid:**

1. Not unsubscribing from events
2. Not clearing timeouts
3. Updating state after unmount

### Q10: Why use useRef for auto-scrolling?

**Answer:**

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // This triggers after EVERY render of messages
  messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
}, [messages]);

// In JSX
<div className="messages">
  {messages.map(msg => <Message key={msg.id} msg={msg} />)}
  <div ref={messagesEndRef} /> {/* Invisible marker at bottom */}
</div>
```

**Why useRef?**

- useRef doesn't cause re-renders (setter doesn't trigger state update)
- Persists across renders (same reference)
- Direct DOM access (needed for scrollIntoView)

**Without useRef (wrong):**

```typescript
const [messagesEnd, setMessagesEnd] = useState(null);
// This would cause infinite loop: state update → render → scroll → state update
```

## Final Thoughts

### Skills Demonstrated:

1. **Full-stack development** - Frontend and backend equally strong
2. **Real-time systems** - Understanding of WebSocket, async patterns
3. **Problem solving** - Identifying and fixing issues
4. **Scalability thinking** - Considering 100K users, not just 10
5. **Security awareness** - Authentication, encryption, validation

### How to Talk About This Project:

- Start with "why" - why real-time chat? Why these technologies?
- Show breadth - handled frontend UI, backend server, database design concepts
- Show depth - explain why architecture decisions (Socket.io over WebSocket)
- Show growth - what would you do differently now?
- Show learning - what did you learn building this?
