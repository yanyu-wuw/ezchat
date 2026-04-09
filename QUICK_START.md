# EzChat - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd ezchat
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development servers**
   ```bash
   pnpm dev
   ```

### Access the Application

- **Frontend**: Open http://localhost:5173 in your browser
- **Backend API**: http://localhost:3000
- **Socket.io**: ws://localhost:3000

## 📝 First Time Setup

1. Create a `.env` file (optional for basic demo):
   ```bash
   cp .env.example .env
   ```

2. Enter a username in the login form
3. Multiple users can connect in different browser tabs/windows
4. Start chatting in real-time!

## 🎯 Available Scripts

```bash
# Development mode - runs all apps
pnpm dev

# Production build
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Start production server
pnpm start
```

## 🏗️ Project Structure

```
ezchat/
├── apps/
│   ├── server/       # Express + Socket.io backend
│   └── web/          # React frontend
├── packages/
│   └── types/        # Shared TypeScript types
└── README.md
```

## 💡 Features to Try

1. **Real-time Messaging**
   - Open multiple browser tabs
   - Send messages between users

2. **User Presence**
   - See online users in the sidebar
   - View user status (online/offline)

3. **Typing Indicators**
   - Start typing to see "User is typing..."
   - Message sent confirmation

4. **Direct Messages**
   - Select a user from the list
   - Messages are delivered in real-time

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```env
# Server
SERVER_PORT=3000
NODE_ENV=development

# Client
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## 📚 Documentation

- [Server Documentation](./apps/server/README.md)
- [Web Documentation](./apps/web/README.md)
- [Main README](./README.md)

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use:

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm pnpm-lock.yaml
pnpm install
```

### Build Errors
```bash
# Clean and rebuild
rm -rf dist
pnpm build
```

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Full-stack development
- ✅ Real-time WebSocket communication
- ✅ React hooks and state management
- ✅ TypeScript for type safety
- ✅ Monorepo with Turbo
- ✅ Component-based architecture
- ✅ Responsive UI design

## 📞 Support

For issues or questions, check the README files in each package or create an issue in the repository.

---

**Happy coding! 🚀**
