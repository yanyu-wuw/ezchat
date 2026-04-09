# EzChat Architecture Documentation

## System Architecture Overview

EzChat is a full-stack real-time chat application using a monorepo structure with three main modules:

```
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   (Port: 5173)      │
                    └──────────┬──────────┘
                               │
                               │ WebSocket
                               │ Connection
                               │
                    ┌──────────▼──────────┐
                    │   Socket.io Server  │
                    │   (Port: 3000)      │
                    └──────────┬──────────┘
                               │
                               │ (Future)
                               │
                    ┌──────────▼──────────┐
                    │   PostgreSQL DB     │
                    │   Message Storage   │
                    └─────────────────────┘
```

## Project Structure

### `/apps/server` - Backend Service

- Express.js HTTP server
- Socket.io for real-time WebSocket communication
- In-memory user management (Map data structure)
- REST API endpoints for client discovery
- Error handling and graceful shutdown

#### Key Components:

1. **Socket.io Event Handlers**
   - `user:join` - User connects to chat
   - `message:send` - Send direct or broadcast messages
   - `typing:start` / `typing:stop` - Typing indicators
   - `disconnect` - User leaves chat

2. **REST API Endpoints**
   - `GET /api/health` - Server health check
   - `GET /api/users` - List all online users

3. **In-Memory Data Storage**
   - `activeUsers` Map stores socket connections
   - User data augmented in socket.data
   - No database persistence yet

### `/apps/web` - Frontend Application

- React 19 with TypeScript
- Vite for development and build
- Tailwind CSS for styling
- Socket.io client for WebSocket connection
- Component-based architecture

#### Key Components:

1. **App.tsx** - Main application container
   - State management (users, messages, login)
   - Socket connection lifecycle
   - Socket event listeners
   - Layout: header, sidebar, chat window

2. **ChatWindow.tsx** - Message display and input
   - Message filtering (direct vs broadcast)
   - Auto-scroll to latest messages
   - Input handling with typing indicators
   - Send button and Enter key submission

3. **UserList.tsx** - Online users sidebar
   - Online user list with status indicators
   - User selection for direct messages
   - User avatar with initials

4. **LoginForm.tsx** - Authentication UI
   - Username input validation
   - Form validation (min 3 characters)
   - Simple client-side authentication

### `/packages/types` - Shared Types

- Centralized TypeScript interfaces
- Type safety across frontend and backend
- Interfaces: User, ChatMessage, ChatRoom, Authentication

## Data Flow

### Message Sending Flow

```
User Types Message
        │
        ▼
ChatWindow.tsx (handleSend)
        │
        ▼
Socket.emit("message:send", {text, to?})
        │
        ▼
Server receives and creates ChatMessage
        │
        ├─ If direct message:
        │  └─ Find recipient in activeUsers
        │     └─ Emit to recipient socket
        │
        └─ If broadcast:
           └─ io.emit() to all users
```

### User Joining Flow

```
User submits username in LoginForm
        │
        ▼
App.tsx (handleLogin)
        │
        ▼
Socket.emit("user:join", userData)
        │
        ▼
Server stores socket in activeUsers Map
        │
        ▼
Server emits "users:update" to all clients
        │
        ▼
All clients update their user list (UserList.tsx)
```

## Communication Transport

### Socket.io Events Format

**Client → Server:**

```typescript
socket.emit("message:send", {
  text: string,
  to?: string  // undefined = broadcast
})

socket.emit("typing:start", {
  to?: string
})

socket.emit("user:join", {
  id: string,
  username: string,
  status: "online" | "offline"
})
```

**Server → Client:**

```typescript
socket.on("message:receive", (message: ChatMessage) => {});

socket.on("users:update", (users: User[]) => {});

socket.on("typing:indicator", (data: { username: string }) => {});

socket.on("user:offline", (data: { userId: string }) => {});
```

## React State Management

Main app state in `App.tsx`:

- `isLoggedIn: boolean` - Authentication state
- `currentUser: User | null` - Current user data
- `socket: Socket | null` - WebSocket connection instance
- `messages: ChatMessage[]` - All received messages
- `users: User[]` - Online users list
- `selectedUser: User | null` - Currently selected chat recipient
- `typingStatus: string` - Typing indicator text

## Socket Connection Lifecycle

```
1. User logs in with username
   ↓
2. App.tsx creates Socket.io connection to server
   ↓
3. Connection established, emit "user:join" event
   ↓
4. Server adds socket to activeUsers Map
   ↓
5. Server broadcasts "users:update" to all clients
   ↓
6. App.tsx receives updated user list
   ↓
7. UserList.tsx renders available users
   ↓
8. [Message exchange loop...]
   ↓
9. User clicks logout
   ↓
10. Socket.disconnect() called
    ↓
11. Server removes from activeUsers
    ↓
12. Server broadcasts "user:offline" + "users:update"
```

## Technical Stack Details

### React Component Hierarchy

```
App
├── Header (User info + Logout button)
├── Main Layout
│   ├── UserList (Contacts sidebar)
│   └── ChatWindow
│       ├── Chat Header (Selected user info)
│       ├── Messages Area (Scrollable message list)
│       └── Input Area (Message input + Send button)
└── LoginForm (Not rendered when logged in)
```

### Event-Driven Architecture

- All real-time communication via Socket.io events
- No HTTP polling for updates
- Bi-directional communication model
- Event names follow pattern: `resource:action`

## Performance Considerations

### Current Limitations:

1. In-memory storage - data lost on server restart
2. No message persistence - only current session
3. No database queries - scalability limited
4. No authentication/authorization - anyone can join
5. No message encryption
6. No media/file sharing

### Scalability Improvements Needed:

1. Database integration (PostgreSQL)
2. JWT authentication
3. Redis for distributed socket management
4. Message history queries
5. User profiles and settings
6. Room/channel support
7. Message search functionality

## Code Organization Patterns

### TypeScript Usage:

- Strict type checking throughout
- Interface definitions in shared types package
- Generic types for Socket.io handlers
- Type-safe component props

### React Patterns:

- Functional components with hooks
- useEffect for lifecycle management
- useState for component state
- useRef for DOM access (auto-scroll)
- Custom event handlers

### Socket.io Patterns:

- Namespaced event names
- Optional message parameters (to?, for direct/broadcast)
- Map-based socket lookup for performance
- Broadcast vs direct emission patterns

## Future Architecture Roadmap

1. **Database Layer** - PostgreSQL for persistence
2. **Authentication** - JWT token-based auth
3. **Message History** - Query previous conversations
4. **User Profiles** - Avatar, bio, status settings
5. **Channels & Rooms** - Group chat support
6. **File Sharing** - Image and document uploads
7. **AI Integration** - AI assistant features
8. **Notifications** - Push notifications
9. **Mobile App** - React Native for iOS/Android
10. **Analytics** - Usage tracking and reporting
