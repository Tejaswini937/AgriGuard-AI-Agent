# 🌱 AgriGuard AI — Plant Disease Analyzer

## 📌 Overview

AgriGuard AI is an intelligent system that detects plant diseases using artificial intelligence. Farmers often struggle to identify diseases early, leading to crop loss and reduced productivity. Our solution provides instant disease detection along with treatment suggestions and weather-based insights.

## 🎯 Problem Statement

Farmers rely on manual inspection or experts to identify plant diseases, which is time-consuming and not always accessible. This leads to delayed treatment and crop damage.

## 💡 Solution

Our system allows users to upload plant images, which are analyzed using AI (Google Gemini). The system detects diseases and provides:

* Disease name
* Severity level
* Chemical treatment
* Organic solutions
* Follow-up care

It also integrates real-time weather data to improve decision-making.

## ✨ Key Features

* 🤖 AI-based plant disease detection
* 🌦️ Real-time weather integration
* 💊 Treatment recommendations
* 🌿 Organic solutions
* 🌍 Multi-language support

## ⚙️ Technologies Used

* Frontend: Next.js (React)
* Backend: FastAPI (Python)
* AI Model: Google Gemini
* Weather API: OpenWeather API
* Tools: Git, GitHub

## 🔄 How It Works

User uploads image → Backend processes → AI analyzes → Disease + treatment displayed on UI

---

# 🌿 PlantAI — Plant Disease Analyzer

AI-powered plant disease detection using Google Gemini + Next.js + FastAPI.

---

## ✅ QUICK START (Do these steps in order)

---

### STEP 1 — Get your free Gemini API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

---

### STEP 2 — Setup the Backend

Open a terminal and run:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Mac/Linux):
source venv/bin/activate

# Activate it (Windows):
# venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

Now open the `.env` file and replace `your_gemini_api_key_here` with your actual Gemini API key.

Then run the backend:
```bash
uvicorn main:app --reload
```

You should see: `Uvicorn running on http://127.0.0.1:8000`
Leave this terminal open.

---

### STEP 3 — Setup the Frontend

Open a NEW terminal and run:

```bash
cd frontend
npm install
npm run dev
```

You should see: `Local: http://localhost:3000`

---

### STEP 4 — Use the app

1. Open http://localhost:3000 in your browser
2. Upload a photo of a plant
3. Choose your language (English, Hindi, Tamil, Telugu)
4. Optionally type your location
5. Click "Run AI Analysis"
6. Results appear on the right in 10–20 seconds

---

## Project Structure

```
plant-analyzer/
├── backend/
│   ├── main.py           ← FastAPI server
│   ├── ai_service.py     ← Gemini AI logic
│   ├── requirements.txt  ← Python packages
│   └── .env              ← YOUR API KEY GOES HERE
│
└── frontend/
    ├── app/
    │   ├── globals.css   ← Styles
    │   ├── layout.tsx    ← Root layout
    │   └── page.tsx      ← Main UI
    ├── components/
    │   ├── Sidebar.tsx   ← Left navigation
    │   └── ResultCard.tsx← Result display cards
    └── package.json
```

---

## Common Problems

| Problem | Fix |
|---------|-----|
| `GEMINI_API_KEY not found` | Open `.env` and paste your key (no quotes) |
| `Cannot connect to backend` | Make sure backend terminal is running |
| `npm: command not found` | Install Node.js from https://nodejs.org |
| `python: command not found` | Install Python from https://python.org |
| `pip install error` | Try: `pip install -r requirements.txt --break-system-packages` |
