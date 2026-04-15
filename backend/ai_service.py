import google.generativeai as genai
import json
import re
import os
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


def analyze_plant_image(image_bytes: bytes, language: str, location: str) -> dict:
    language_map = {
        "en": "English",
        "hi": "Hindi",
        "ta": "Tamil",
        "te": "Telugu",
    }
    lang_name = language_map.get(language, "English")

    image = Image.open(io.BytesIO(image_bytes))

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
You are an expert agricultural plant pathologist and botanist.

Analyze the plant in the image carefully.

Location context: {location if location else "Not specified"}

Respond ONLY in {lang_name} language.

Identify any disease, pest damage, nutrient deficiency, or health issue visible in the plant.

Return your response as a VALID JSON object with EXACTLY these keys:
{{
  "disease": "Name of the disease or condition detected. If the plant is healthy, write 'No disease detected — plant appears healthy'.",
  "severity": "One of: Healthy / Mild / Moderate / Severe. Include a short explanation of why.",
  "treatment": "Step-by-step chemical or conventional treatment plan. Be specific with product types and application frequency.",
  "organic_solution": "Step-by-step organic or natural treatment using household or farm-available items. Be specific.",
  "follow_up": "What the farmer should monitor, when to re-check, and when to seek expert help."
}}

IMPORTANT RULES:
- Return ONLY the JSON object. No markdown, no code blocks, no extra text.
- All values must be strings.
- Write all content in {lang_name}.
- Be practical, detailed, and helpful for a small-scale farmer.
"""

    response = model.generate_content([prompt, image])
    raw_text = response.text.strip()

    raw_text = re.sub(r"```json\s*", "", raw_text)
    raw_text = re.sub(r"```\s*", "", raw_text)
    raw_text = raw_text.strip()

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = {
                "disease": "Analysis completed but formatting error occurred.",
                "severity": "Unknown",
                "treatment": raw_text,
                "organic_solution": "Please retry for structured organic solutions.",
                "follow_up": "Please consult a local agricultural expert.",
            }

    required_keys = ["disease", "severity", "treatment", "organic_solution", "follow_up"]
    for key in required_keys:
        if key not in result:
            result[key] = "Information not available."

    return result