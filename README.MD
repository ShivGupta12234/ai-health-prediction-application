
# 🏥 HealthMateAI — AI-Powered Disease Prediction

> An intelligent full-stack healthcare application that leverages AI and machine learning to predict diseases, assess mortality risks, and provide personalized health recommendations — wrapped in a premium dark-mode glassmorphism UI.

---

## ✨ Features

| Category | Feature | Description |
|---|---|---|
| 🔐 **Auth** | JWT Authentication | Secure registration & login with bcrypt (12 rounds) password hashing |
| 🤖 **AI** | Disease Prediction | Predicts 14+ diseases via rule-based + optional Hugging Face NLP enhancement |
| ⚠️ **Risk** | Mortality Risk Assessment | Real-time risk scoring based on age, vitals, and disease severity |
| 💊 **Health** | Personalized Recommendations | Tailored health advice for each predicted condition |
| 📊 **Analytics** | Interactive Dashboard | Pie charts, bar charts, stats cards, and prediction timeline |
| 📄 **Reports** | PDF Export | Professional PDF health reports via jsPDF + autoTable |
| 🧬 **UX** | DNA Helix Loading | Animated loading overlay during AI processing |
| 🎨 **Design** | Glassmorphism Dark Mode | Premium UI with Framer Motion animations, toasts, and typewriter effects |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI Framework |
| Vite | 5.4 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 12.x | Animations & transitions |
| React Router DOM | 6.30 | Client-side routing |
| Recharts | 2.15 | Dashboard charts (Pie, Bar) |
| Lucide React | 0.344 | Icon system |
| Axios | 1.13 | HTTP client with interceptors |
| jsPDF + autoTable | 4.2 / 5.0 | PDF report generation |
| react-hot-toast | 2.6 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥18.0 | Runtime |
| Express | 5.1 | Web framework |
| MongoDB / Mongoose | 8.19 | Database & ODM |
| JWT | 9.0 | Token authentication |
| bcryptjs | 3.0 | Password hashing |
| Helmet | 8.1 | Security headers |
| express-rate-limit | 8.3 | Brute-force protection |
| express-validator | 7.3 | Input validation & sanitization |
| Hugging Face API | 4.13 | Optional ML enhancement |

---

## 📋 Prerequisites

- **Node.js** v18.0 or higher
- **MongoDB** (local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- **Git**
- **npm** (comes with Node.js)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ShivGupta12234/ai-health-prediction-application.git
cd ai-health-prediction-application
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create your environment file
# (copy the template below into backend/.env)
```

Create **`backend/.env`** with:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/health-ai
JWT_SECRET=your_super_secure_random_secret_min_32_chars
FRONTEND_URL=http://localhost:3000

# Optional — enhances predictions with Hugging Face NLP
HUGGINGFACE_API_KEY=hf_your_api_key_here
```

Start the backend:

```bash
npm run dev
# ✅ Server running on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend
npm install

# Create your environment file
# (copy the template below into frontend/.env)
```

Create **`frontend/.env`** with:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
# ✅ App running on http://localhost:3000
```

### 4. Open the Application

Navigate to **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
ai-health-prediction-application/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection with retry logic
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   └── predictionController.js # Create, list, stats, get-by-id
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & user injection
│   │   └── validate.js            # express-validator rules & runner
│   ├── models/
│   │   ├── User.js                # User schema (bcrypt, timestamps)
│   │   └── Prediction.js          # Prediction schema (compound index)
│   ├── routes/
│   │   ├── authRoutes.js          # POST /register, /login, GET /profile
│   │   └── predictionRoutes.js    # CRUD + stats endpoints
│   ├── utils/
│   │   ├── aiService.js           # Disease DB, risk calc, recommendations
│   │   ├── ApiError.js            # Structured HTTP error class
│   │   ├── asyncHandler.js        # try/catch wrapper for controllers
│   │   └── validateEnv.js         # Startup env var validation
│   ├── server.js                  # Express app, middleware, error handler
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # GlassCard, LoadingSpinner, AnimatedCounter, ProtectedRoute
│   │   │   └── layout/            # Navbar, Footer
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx    # Auth state, login/register/logout
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page with typewriter hero
│   │   │   ├── Login.jsx          # Login form with shake animation
│   │   │   ├── Register.jsx       # Registration with password strength
│   │   │   ├── Dashboard.jsx      # Analytics, charts, prediction history
│   │   │   ├── Predict.jsx        # Symptom input, vital signs, DNA loading
│   │   │   ├── Result.jsx         # Prediction result, risk gauge, PDF export
│   │   │   └── NotFound.jsx       # Animated 404 page
│   │   ├── services/
│   │   │   └── api.js             # Axios instance, interceptors, API methods
│   │   ├── App.jsx                # Router config
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind + custom design system
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login & get JWT token |
| `GET` | `/api/auth/profile` | ✅ | Get current user profile |

### Predictions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/predictions` | ✅ | Create a new prediction |
| `GET` | `/api/predictions` | ✅ | List user's predictions (paginated) |
| `GET` | `/api/predictions/stats` | ✅ | Get health statistics |
| `GET` | `/api/predictions/:id` | ✅ | Get prediction by ID |

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Health check (status, uptime) |

> **Auth**: Pass `Authorization: Bearer <token>` header.

---

## 🧪 Testing the Application

### Quick Test Scenarios

**1. Register a User**
```
Name: Test User | Email: test@example.com | Password: Test@123456 | Age: 25 | Gender: Male
```

**2. Common Cold (Low Risk)**
```
Symptoms: cough, runny nose, sore throat | Expected: Low Risk, ~30-40% confidence
```

**3. Influenza (Medium/High Risk)**
```
Symptoms: high fever, body aches, fatigue | Temperature: 39.5°C | Expected: Medium Risk
```

**4. COVID-19 (High Risk)**
```
Symptoms: fever, dry cough, loss of taste, loss of smell | SpO2: 92% | Expected: High/Critical
```

**5. Dashboard**
```
✓ Stats cards load with animated counters
✓ Pie chart shows risk distribution
✓ Bar chart shows risk analysis
✓ Prediction history is clickable
```

**6. PDF Export**
```
✓ Click "Download PDF Report" on any result page
✓ PDF includes tables, headers, disclaimer
```

---

## 🔒 Security Hardening

This application implements the following security measures:

| Layer | Measure | Configuration |
|---|---|---|
| **Headers** | Helmet | Cross-origin policies relaxed for API |
| **CORS** | Explicit origin | Only `FRONTEND_URL` allowed |
| **Rate Limit** | Global | 100 requests / 15 min per IP |
| **Rate Limit** | Auth routes | 15 attempts / 15 min per IP |
| **Body** | Size limit | 1 MB max payload |
| **Passwords** | bcrypt | 12 salt rounds |
| **Tokens** | JWT | 30-day expiry |
| **Input** | express-validator | All routes validated & sanitized |
| **Errors** | Centralized handler | No stack traces in production |
| **DB** | Connection retry | Exponential backoff |
| **Process** | Graceful shutdown | SIGTERM / SIGINT / unhandledRejection |

---

## 🌐 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step guides on deploying to:

- **Backend** → [Render](https://render.com) / [Railway](https://railway.app)
- **Frontend** → [Vercel](https://vercel.com) / [Netlify](https://netlify.com)
- **Database** → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 👥 Team

**Team ID**: 26_CS_DS_4B_5

| Name | Role | Roll No. |
|---|---|---|
| Shiv Prakash Gupta | Team Leader | 2201640310107 |
| Anushka Tiwari | Developer | 2201641540022 |
| Arpit Gupta | Developer | 2201641540027 |
| Saksham Chaturvedi | Developer | 2101641540073 |

---

## 📄 License

This project is developed as part of the academic curriculum at **Pranveer Singh Institute Of Technology (PSIT), Kanpur**.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch — `git checkout -b feature/AmazingFeature`
3. **Commit** your changes — `git commit -m 'Add AmazingFeature'`
4. **Push** to the branch — `git push origin feature/AmazingFeature`
5. **Open** a Pull Request

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co) — ML model inference API
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Cloud database
- [React](https://react.dev) & [Vite](https://vitejs.dev) — Frontend tooling
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) — Animation library
- [Recharts](https://recharts.org) — Chart components

---

<p align="center">
  <b>⭐ If you find this project helpful, please give it a star!</b>
</p>
