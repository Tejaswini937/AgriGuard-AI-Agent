from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ai_service import analyze_plant_image
import uvicorn
import requests

app = FastAPI(
    title="Plant Disease Analyzer API",
    description="AI-powered plant disease detection using Google Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 YOUR OPENWEATHER API KEY
WEATHER_API_KEY = "10078b76c2aeaaad33150d060be36d51"


# ── BASIC ROUTES ─────────────────────────────
@app.get("/")
def root():
    return {"status": "Plant Disease Analyzer API is running 🌿"}


@app.get("/health")
def health():
    return {"status": "ok"}


# ── WEATHER API ─────────────────────────────
@app.get("/weather")
def get_weather(location: str = Query(...)):
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={WEATHER_API_KEY}&units=metric"
        
        response = requests.get(url)
        data = response.json()

        print("Weather API response:", data)  # 🔍 debug

        # ❗ If API fails, return actual error
        if response.status_code != 200:
            return {"error": data}

        weather = {
            "temp": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "wind": data["wind"]["speed"],
            "condition": data["weather"][0]["main"],
            "rainRisk": data.get("clouds", {}).get("all", 0),
            "icon": "☀️" if data["weather"][0]["main"] == "Clear"
                    else "🌧️" if "Rain" in data["weather"][0]["main"]
                    else "☁️",
            "advisory": "Avoid spraying before rain" if "Rain" in data["weather"][0]["main"]
                        else "Good conditions for farming"
        }

        return weather

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── AI ANALYSIS ROUTE ─────────────────────────
@app.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    language: str = Form(default="en"),
    location: str = Form(default=""),
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    max_size = 10 * 1024 * 1024
    image_bytes = await image.read()

    if len(image_bytes) > max_size:
        raise HTTPException(status_code=400, detail="Image size must be under 10MB.")

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        result = analyze_plant_image(
            image_bytes=image_bytes,
            language=language,
            location=location,
        )
        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )


# ── RUN SERVER ───────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)