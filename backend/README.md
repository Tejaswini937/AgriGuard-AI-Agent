# Backend Setup Instructions

## Step 1 — Create & activate virtual environment

### Mac / Linux:
```
python -m venv venv
source venv/bin/activate
```

### Windows:
```
python -m venv venv
venv\Scripts\activate
```

## Step 2 — Install dependencies
```
pip install -r requirements.txt
```

## Step 3 — Add your Gemini API key
- Open the `.env` file
- Replace `your_gemini_api_key_here` with your actual key
- Get a free key at: https://aistudio.google.com/app/apikey

## Step 4 — Run the backend
```
uvicorn main:app --reload
```

You should see:
  Uvicorn running on http://127.0.0.1:8000

Leave this terminal running and open a new one for the frontend.
