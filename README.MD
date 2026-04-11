# 🏥 AI-Powered Disease Recognition, Early-Diagnosis, And Risk-Stratification System

An Intelligent full-stack healthcare application that leverages AI and machine learning to predict diseases, assess mortality risks, and provide personalized health recommendations.
Check it out: https://healthmateai-app.vercel.app/

This project is developed as part of an academic curriculum final year major project at Pranveer Singh Institute Of Technology (PSIT), Knapur

## 👥Made by:

**Team ID**: 26_CS_DS_4B_5

- **Shiv Prakash Gupta** - 2201640310107 [Team Leader] 
- **Anushka Tiwari** - 2201641540022
- **Arpit Gupta** - 2201641540027
- **Saksham Chaturvedi** - 2101641540073


## 🌟 Features

- **🔐 User Authentication**: Secure registration and login with JWT
- **🤖 AI-Powered Disease Prediction**: Predicts 14+ diseases using ML algorithms
- **⚠️ Mortality Risk Assessment**: Real-time risk calculation based on vital signs
- **📊 Interactive Dashboard**: Comprehensive health analytics with charts
- **💊 Personalized Recommendations**: Tailored health advice for each prediction
- **📈 Prediction History**: Track your health journey over time
- **📱 Responsive Design**: Works seamlessly on desktop and mobile


## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & Bcrypt
- **AI/ML**: Hugging Face Inference API
- **Security**: CORS, Helmet (recommended)

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git
- npm or yarn


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🚀 Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ShivGupta12234/ai-health-prediction-application.git
cd ai-health-prediction-application
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update .env with your configuration
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string
# - HUGGINGFACE_API_KEY: Your HF API key (optional)

# Start MongoDB (if using local MongoDB)
# Windows: MongoDB should start automatically as a service
# Linux/Mac: sudo systemctl start mongod

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
ai-health-prediction-application/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── predictionController.js # Prediction logic
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Prediction.js         # Prediction schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── predictionRoutes.js   # Prediction endpoints
│   ├── utils/
│   │   └── aiService.js          # AI/ML prediction logic
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable components
│   │   │   └── layout/           # Layout components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Predict.jsx
│   │   │   └── Result.jsx
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

## 🧪 Testing the Application

### Test Scenarios

1. **User Registration**

   - Name: Test User
   - Email: test@example.com
   - Password: test123456
   - Age: 25
   - Gender: Male

2. **Disease Prediction - Common Cold**

   - Symptoms: cough, runny nose, sore throat
   - Expected: Low Risk

3. **Disease Prediction - Influenza**

   - Symptoms: high fever, body aches, fatigue
   - Vital Signs: Temperature 39.5°C
   - Expected: Medium/High Risk

4. **Dashboard Features**
   - View statistics
   - Check charts
   - Review prediction history

---
**⭐ If you find this project helpful, please give it a star!**
