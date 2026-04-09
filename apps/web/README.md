# EzChat Web

React 19 real-time chat frontend with Tailwind CSS.

## Features

- Modern React 19 UI
- Vite for fast development
- Real-time messaging
- User presence system
- Typing indicators
- Responsive design

## Environment Variables

```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Running

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview build
pnpm preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatWindow.tsx
│   ├── UserList.tsx
│   └── LoginForm.tsx
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```
