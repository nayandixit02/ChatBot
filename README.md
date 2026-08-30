# 🤖 MERN-CHAT — Full-Stack AI Chatbot with Google Gemini

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Test Coverage](https://img.shields.io/badge/Coverage-95.2%25-brightgreen?logo=jest&logoColor=white)](https://github.com/nayandixit02/ChatBot)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/nayandixit02/ChatBot)
[![Deployed on Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=black)](https://render.com/)

**MERN-CHAT** is a modern, responsive, full-stack AI Conversational Assistant powered by **Google Gemini AI (`gemini-3.6-flash`)** and the **MERN** stack (MongoDB, Express, React, Node.js + TypeScript). 

It features JWT authentication, seamless cross-origin cookie & bearer support, conversation persistence, rich markdown & syntax-highlighted code rendering, one-click copy actions, interactive starter prompts, responsive sidebar drawer for mobile, a dark/light mode theme toggle, an automated test suite with **95% code coverage**, and a continuous deployment (CI/CD) pipeline on GitHub Actions.

---

## 🌐 Live Demos

- **Frontend Web App**: [https://chatbot-8y9v.onrender.com](https://chatbot-8y9v.onrender.com)
- **Backend API Service**: [https://chatbot-backend-9rf1.onrender.com](https://chatbot-backend-9rf1.onrender.com)
- **Health Check & Model Status**: [https://chatbot-backend-9rf1.onrender.com/test-key](https://chatbot-backend-9rf1.onrender.com/test-key)

---

## ✨ Key Features

- **⚡ Google Gemini 3.6 AI Engine**: Real-time natural language and coding responses powered by `@google/generative-ai` with automatic model fallback cascading and HTTP 429 quota exhaustion resilience.
- **🎨 Dark & Light Mode Theme Toggle**: Seamless dynamic theme switching with persistent local storage preferences and custom styling for both modes.
- **💻 Rich Markdown & Syntax Highlighting**: Clean rendering of code blocks with language labels, one-click copy buttons, structured headings, lists, and bold text.
- **📱 Fully Responsive Design**: Mobile-friendly navigation with slide-out sidebar drawer, collapsible layout, and smooth animations.
- **🔐 Secure Authentication Flow**: 
  - Password hashing with `bcrypt`.
  - JWT generation and verification.
  - Dual token support: HTTP-only cookies + `Authorization: Bearer <token>` for third-party cookie blocking environments.
- **💾 Conversation History Persistence**: Store, retrieve, and clear conversations linked securely to authenticated user accounts in MongoDB.
- **🧪 95% Automated Test Coverage**: Robust test suite using **Jest** and **Supertest** covering 63 test cases across auth middleware, validation chains, user controllers, and chat generation.
- **🚀 CI/CD Automated Pipeline**: GitHub Actions workflow running tests, lint checks, and automated zero-downtime deployment to Render on merge to `main`.
- **💡 Interactive Starter Prompt Chips**: Quick-start suggestions for coding interview questions, system design architecture, and code reviews.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components & Icons**: [Material UI (MUI v7)](https://mui.com/), [React Icons](https://react-icons.github.io/react-icons/)
- **Code Highlighting**: [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) (Prism engine)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **AI SDK**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- **Testing**: [Jest](https://jestjs.io/), [Supertest](https://github.com/ladjs/supertest), [ts-jest](https://kulshekhar.github.io/ts-jest/)
- **Security & Utilities**: `jsonwebtoken`, `bcrypt`, `cookie-parser`, `cors`, `dotenv`, `express-validator`, `morgan`

### DevOps & CI/CD
- **Continuous Integration**: [GitHub Actions](https://github.com/features/actions)
- **Hosting / Deployment**: [Render](https://render.com/) (Web Service + Deploy Hook)

---

## 🧪 Testing & Code Coverage

The backend includes a comprehensive unit and integration test suite built with **Jest** and **Supertest** running natively in Node ESM.

### Run Tests Locally
```bash
# Run all tests
npm test

# Run tests with code coverage report
npm run test:coverage
```

### Coverage Metrics Summary (`jest --coverage`)

```text
----------------------|---------|----------|---------|---------|--------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s  
----------------------|---------|----------|---------|---------|--------------------
All files             |   95.29 |    69.52 |      90 |   95.23 |                    
 src                  |   93.33 |    42.85 |     100 |   93.33 |                    
  app.ts              |   93.33 |    42.85 |     100 |   93.33 | 32                 
 src/config           |     100 |      100 |     100 |     100 |                    
  gemini-config.ts    |     100 |      100 |     100 |     100 |                    
 src/controllers      |   94.04 |    67.05 |   86.66 |   93.93 |                    
  chat-controllers.ts |   93.25 |     64.7 |   77.77 |    93.1 | 7,43,84,95,166-167 
  user-controllers.ts |   94.93 |    70.58 |     100 |   94.87 | 9,50,99,166        
 src/models           |     100 |      100 |     100 |     100 |                    
  User.ts             |     100 |      100 |     100 |     100 |                    
 src/routes           |     100 |      100 |     100 |     100 |                    
  chats-routes.ts     |     100 |      100 |     100 |     100 |                    
  index.ts            |     100 |      100 |     100 |     100 |                    
  user-routes.ts      |     100 |      100 |     100 |     100 |                    
 src/utils            |     100 |      100 |     100 |     100 |                    
  constants.ts        |     100 |      100 |     100 |     100 |                    
  token-manager.ts    |     100 |      100 |     100 |     100 |                    
  validators.ts       |     100 |      100 |     100 |     100 |                    
----------------------|---------|----------|---------|---------|--------------------
Test Suites: 6 passed, 6 total
Tests:       63 passed, 63 total
```

---

## ⚙️ CI/CD Pipeline & Auto-Deployment

Automated CI/CD is configured via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. **Test & Lint Job (`test-and-lint`)**:
   - Triggers on all **Pushes** and **Pull Requests** targeting `main`.
   - Runs backend unit & integration tests (`npm run test:coverage`).
   - Runs backend TypeScript build validation (`npm run build`).
   - Runs frontend ESLint code style checks (`npm run lint`).
   - Runs frontend Vite production build (`npm run build`).
2. **Deploy Job (`deploy`)**:
   - Triggers automatically **only after all tests and lints pass** on `main`.
   - Sends a secure webhook POST request to the Render Deploy Hook (`RENDER_DEPLOY_HOOK_URL`), triggering a live zero-downtime deployment.

---

## 📂 Project Structure

```
ChatBot/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD Pipeline: Test, Lint & Deploy to Render
│
├── backend/
│   ├── src/
│   │   ├── __tests__/          # Jest & Supertest test suites (63 tests)
│   │   │   ├── api-routes.test.ts
│   │   │   ├── chat-controllers.test.ts
│   │   │   ├── gemini-config.test.ts
│   │   │   ├── setupEnv.cjs
│   │   │   ├── token-manager.test.ts
│   │   │   ├── user-controllers.test.ts
│   │   │   └── validators.test.ts
│   │   ├── config/             # Gemini AI configuration
│   │   ├── controllers/        # User and Chat controllers
│   │   ├── db/                 # MongoDB connection logic
│   │   ├── models/             # Mongoose User and Chat schemas
│   │   ├── routes/             # Express API routes (/user, /chat)
│   │   ├── utils/              # Token manager, validators, constants
│   │   ├── app.ts              # Express middleware and CORS setup
│   │   └── index.ts            # Server entrypoint and DB listener
│   ├── jest.config.cjs         # Jest ESM + TypeScript configuration
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── public/                 # Static assets, logos, _redirects for SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/           # ChatItem, MarkdownContent
│   │   │   ├── footer/         # Theme-aware Footer
│   │   │   ├── shared/         # CustomizedInput, NavigationLink, Logo
│   │   │   ├── typer/          # Typing animation
│   │   │   └── Header.tsx      # Header with Theme Toggle & Navigation
│   │   ├── context/            # AuthProvider & ThemeContext
│   │   ├── helpers/            # Axios API communicator & sanitizers
│   │   ├── pages/              # Home, Login, Signup, Chat, NotFound
│   │   ├── App.tsx             # Routes & protected route guards
│   │   ├── index.css           # Global typography & transitions
│   │   └── main.tsx            # Root setup & ThemeProvider
│   ├── vite.config.ts
│   └── package.json
│
├── .gitignore
├── package.json                # Root concurrently workspace scripts
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v20 or higher recommended)
- **MongoDB** instance (local or MongoDB Atlas connection string)
- **Google Gemini API Key** (Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/nayandixit02/ChatBot.git
cd ChatBot
```

### 2. Configure Backend Environment
Navigate to `backend` and create a `.env` file:
```env
PORT=5000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chatbot?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
COOKIE_SECRET=your_super_secret_cookie_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
FRONTEND_URL=http://localhost:5173
```

### 3. Configure Frontend Environment
Navigate to `frontend` and create a `.env` file (optional, defaults to local API in dev):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 4. Install Dependencies & Run
In the root directory, install and start both services concurrently:
```bash
# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run both frontend & backend concurrently
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 API Endpoints Reference

### 🔐 User & Auth Routes (`/api/v1/user`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/user/signup` | Register a new user | ❌ |
| `POST` | `/api/v1/user/login` | Login user & issue JWT | ❌ |
| `GET` | `/api/v1/user/auth-status` | Verify current session/token | ✅ |
| `GET` | `/api/v1/user/logout` | Clear cookie & logout user | ✅ |
| `GET` | `/api/v1/user` | List all users | ❌ |

### 💬 Chat & AI Routes (`/api/v1/chat`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/chat/new` | Send a prompt to Gemini AI | ✅ |
| `GET` | `/api/v1/chat/chats` | Retrieve conversation history | ✅ |
| `DELETE` | `/api/v1/chat/delete` | Delete all stored user chats | ✅ |
| `GET` | `/api/v1/chat/test-key` | Health check Gemini API key & models | ❌ |

---

## 🛡️ License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

Crafted by **[Nayan Dixit](https://github.com/nayandixit02)**.
