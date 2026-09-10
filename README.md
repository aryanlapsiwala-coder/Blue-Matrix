# KnowPass - Campus Knowledge Management System

KnowPass is a modern, role-aware Campus Knowledge Management and Resource Repository built with **React**, **Vite**, **Tailwind CSS**, **React Router v6**, and **Axios**.

---

## 🚀 Key Features

- **Role-Based Access Control (RBAC)**: Support for 4 distinct campus roles:
  - `STUDENT`: Access lecture notes, ask campus AI queries, submit study resources.
  - `FACULTY`: Publish syllabi, verify student contributions, host QA.
  - `TECHNICIAN`: Manage laboratory equipment SOPs, hardware maintenance, and troubleshooting guides.
  - `ADMIN`: Full system administration, moderation approval queue, and user role management.
- **Axios JWT Interceptor**:
  - Request interceptor automatically attaching `Authorization: Bearer <token>` to outgoing requests.
  - Response interceptor catching `401 Unauthorized` to attempt automatic token refresh or gracefully purge expired sessions.
- **Interactive Pages**:
  - `Login.jsx` & `Register.jsx`: Multi-role login and registration with one-click demo role testing buttons.
  - `Dashboard.jsx`: Role-tailored metrics, contribution stream, and quick shortcuts.
  - `KnowledgeBase.jsx`: Search, filter by category/department, upvote, and preview modal.
  - `Contribute.jsx`: Multi-category document and SOP publisher.
  - `Chat.jsx`: Interactive campus AI knowledge query assistant with instant contextual responses.
  - `Admin.jsx`: Pending verification queue and dynamic role assignment (Protected for `ADMIN`).
  - `Profile.jsx`: User profile, active JWT token viewer, and instant role switcher.

---

## 📂 Project Structure

```
KnowPass/
├── package.json               # Dependencies and build scripts
├── vite.config.js             # Vite configuration with @ path aliases
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── index.html                 # HTML root
├── .env.example               # Environment variables template
├── .gitignore
├── README.md
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Router configuration & Auth provider
    ├── index.css              # Tailwind base layers & custom scrollbar
    ├── constants/
    │   ├── roles.js           # Roles: STUDENT, FACULTY, TECHNICIAN, ADMIN
    │   └── routes.js          # Application route definitions
    ├── context/
    │   └── AuthContext.jsx    # Auth state manager & session listener
    ├── hooks/
    │   └── useAuth.js         # Custom auth consumer hook
    ├── services/
    │   ├── api.js             # Axios instance with JWT interceptors
    │   ├── authService.js     # Auth API & demo mock fallbacks
    │   └── knowledgeService.js# Knowledge CRUD & sample dataset
    ├── utils/
    │   ├── tokenStorage.js    # LocalStorage JWT token manager
    │   └── formatters.js      # Date & text helper utilities
    ├── components/
    │   ├── common/
    │   │   ├── ProtectedRoute.jsx # RBAC & Authentication route guard
    │   │   ├── Button.jsx         # Styled button component
    │   │   └── Card.jsx           # Styled card components
    │   └── layout/
    │       ├── AppLayout.jsx      # Top Navbar + Sidebar + Outlet layout
    │       ├── Navbar.jsx         # Sticky header with role switch dropdown
    │       └── Sidebar.jsx        # Navigation sidebar filtered by role
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── Dashboard.jsx
        ├── KnowledgeBase.jsx
        ├── Contribute.jsx
        ├── Chat.jsx
        ├── Admin.jsx
        ├── Profile.jsx
        └── NotFound.jsx
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
