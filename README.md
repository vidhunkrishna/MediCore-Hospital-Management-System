# 🏥 MediCore – Intelligent Hospital Operations Management System

> AI-powered Hospital Operations Platform built for the AWS User Group Madurai Build Event using React, Express, Prisma, and Google Gemini AI.

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Express](https://img.shields.io/badge/Express-Backend-green)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

# 📖 Overview

MediCore is an intelligent hospital management platform that centralizes hospital operations into one modern dashboard.

The application enables administrators to manage patients, appointments, resources, analytics, and AI-powered operational insights through a clean and responsive interface.

Unlike traditional Hospital Management Systems, MediCore includes an integrated AI Copilot powered by Google Gemini for real-time operational assistance.

---

# ✨ Features

## 🔐 Authentication

- Secure Login
- User Registration
- JWT Authentication
- Protected Routes
- Role-based Access

---

## 📊 Dashboard

- Hospital KPI Cards
- Animated Statistics
- Department Overview
- Recent Patients
- Activity Feed
- Quick Actions

---

## 👨‍⚕️ Patient Management

- Patient List
- Search & Filtering
- Add/Edit Patients
- Patient Details
- Doctor Assignment
- Status Tracking

---

## 📅 Appointment Management

- Appointment Scheduling
- Appointment Status
- Department Assignment
- Doctor Selection

---

## 🏥 Resource Management

- Bed Availability
- Equipment Tracking
- Staff Roster
- Department Resources

---

## 📈 Analytics

Interactive dashboards including:

- Occupancy Trends
- Appointment Forecast
- Department Comparison
- Patient Demographics
- Resource Analytics

---

## 🤖 AI Command Center

Powered by **Google Gemini AI**

Features include:

- AI Hospital Copilot Chat
- Operational Insights
- Resource Recommendations
- Hospital Health Score
- Forecast Analysis
- Critical Alerts
- AI-powered Decision Support

If a Gemini API key is unavailable, the backend automatically falls back to mock AI responses, ensuring uninterrupted functionality.

---

## 📑 Reports

- Operational Reports
- Analytics Summary
- Export Ready Layout

---

## ⚙️ Settings

- Profile Settings
- Theme Support
- Appearance Preferences
- Notification Settings

---

# 🛠 Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Recharts

### Backend

- Express.js
- Prisma ORM
- SQLite
- JWT Authentication
- Google Gemini API

---

# 📂 Project Structure

```
apps/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
│
└── frontend/
    ├── src/
    ├── components/
    ├── pages/
    ├── hooks/
    ├── router/
    └── store/
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/vidhunkrishna/MediCore-Hospital-Management-System.git
```

Go into the project

```bash
cd MediCore-Hospital-Management-System
```

Install dependencies

```bash
npm install
```

---

# ⚙️ Environment Variables

Create

```
apps/backend/.env
```

Example:

```env
DATABASE_URL="file:./dev.db"

JWT_SECRET=your_secret_key

PORT=3001

GEMINI_API_KEY=your_google_gemini_api_key
```

---

# ▶️ Running the Project

Backend

```bash
cd apps/backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:3001
```

---

# 🔑 Demo Credentials

### Administrator

```
Email:
admin@hospital.com

Password:
password123
```

### Doctor

```
Email:
dr.james@hospital.com

Password:
password123
```

### Nurse

```
Email:
nurse.anna@hospital.com

Password:
password123
```

### Receptionist

```
Email:
reception@hospital.com

Password:
password123
```

You can also create new users through the Registration page.

---

# 🧠 AI Features

- Google Gemini Integration
- AI Chat Assistant
- AI Operational Insights
- AI Recommendations
- Forecast Analysis
- Natural Language Hospital Queries

---

# 📸 Screenshots

Add screenshots of:

- Dashboard
- Analytics
- AI Command Center
- Patient Management
- Resource Management

---

# 📌 Future Enhancements

- Real-time Notifications
- Email Alerts
- Multi-Hospital Support
- PDF Report Export
- Voice-enabled AI Assistant
- Predictive Analytics
- Medical Record Integration

---

# 👨‍💻 Author

**Vidhun Krishna S**

GitHub:
https://github.com/vidhunkrishna

LinkedIn:
https://www.linkedin.com/in/vidhun-krishna-s/

---

# 📄 License

This project is released under the MIT License.
