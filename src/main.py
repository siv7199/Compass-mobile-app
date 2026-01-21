from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import compass_logic
import bls_service
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Compass API", description="Backend for Compass HUD")

# CORS Setup
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class ScoreRequest(BaseModel):
    gpa: float
    sat: Optional[int] = None
    budget: int
    major: str # Maps to target_career_soc

class SchoolScore(BaseModel):
    school_id: int
    school_name: str
    compass_score: int
    ranking: str
    debt_years: float | str
    net_price: Optional[int]
    sticker_price: Optional[int]
    earnings: Optional[int]
    debt: Optional[int]
    adm_rate: Optional[float]

@app.get("/api/test")
def health_check():
    return {"status": "Compass Online"}

@app.post("/api/score", response_model=List[SchoolScore])
def get_score(request: ScoreRequest):
    logging.info(f"Score request: {request}")
    try:
        # Pass request.major as target_career_soc
        # Pass request.sat if provided
        results = compass_logic.find_loadout(
            user_gpa=request.gpa,
            target_career_soc=request.major,
            user_budget=request.budget,
            user_sat=request.sat
        )
        # Prompt said "Top 20 schools"
        # Prompt said "Top 20 schools", but we give 50 for variety
        # Limiting to 50 to prevent Timeouts over Tunnel
        return results[:50]
    except Exception as e:
        logging.error(f"Error in get_score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class BossRequest(BaseModel):
    soc_code: str

class BossStats(BaseModel):
    title: Optional[str] = None
    annual_mean_wage: float
    projected_growth: float
    source: str

@app.post("/api/career", response_model=BossStats)
def get_career_stats(request: BossRequest):
    """Get career outlook and salary data"""
    logging.info(f"Career Stats Request: {request.soc_code}")
    stats = bls_service.fetch_boss_stats(request.soc_code)
    return stats

# Keep legacy endpoint for backward compatibility
@app.post("/api/boss", response_model=BossStats)
def fight_boss(request: BossRequest):
    logging.info(f"Career Stats Request (legacy): {request.soc_code}")
    stats = bls_service.fetch_boss_stats(request.soc_code)
    return stats

@app.get("/api/careers/{class_id}")
def get_careers(class_id: str):
    logging.info(f"Career List Request: {class_id}")
    return bls_service.get_careers_for_class(class_id)

# =====================
# AI ENDPOINTS
# =====================

class VibeRequest(BaseModel):
    school_name: str
    school_id: Optional[int] = None

class VibeResponse(BaseModel):
    vibe: str
    source: str = "ai"

class PortfolioRequest(BaseModel):
    colleges: List[dict]  # [{name, tier, acceptance_rate, cost}]

class PortfolioResponse(BaseModel):
    analysis: str
    recommendations: List[str]

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    reply: str

# OpenAI client (lazy init)
_openai_client = None

def get_openai_client():
    global _openai_client
    if _openai_client is None:
        try:
            from openai import OpenAI
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key or api_key == "sk-your-api-key-here":
                return None
            _openai_client = OpenAI(api_key=api_key)
        except ImportError:
            logging.warning("OpenAI library not installed")
            return None
    return _openai_client

SYSTEM_PROMPT = """You are Compass, an intelligent, empathetic college strategy guide. 
You help high school students make financial and educational decisions with clarity.

Guidelines:
- Be professional but accessible, no gaming lingo
- Keep responses under 3 sentences unless asked for detail
- If GPA > 4.0, remind them to use unweighted GPA (0-4.0 scale)
- Differentiate between in-state and out-of-state costs
- Never invent data - say "I don't have that data" if unsure"""

@app.post("/api/ai/vibe", response_model=VibeResponse)
def generate_vibe(request: VibeRequest):
    """Generate a 'vibe' summary for a school"""
    logging.info(f"Vibe Request: {request.school_name}")
    
    client = get_openai_client()
    if not client:
        # Fallback response when no API key
        return VibeResponse(
            vibe=f"{request.school_name} - Check the school's website for campus culture details.",
            source="fallback"
        )
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You summarize college vibes in 2-3 sentences. Cover: campus setting (urban/rural), demographics, and campus feel. Be concise."},
                {"role": "user", "content": f"Describe the vibe of {request.school_name} in 2-3 sentences for a high school student."}
            ],
            max_tokens=150,
            temperature=0.7
        )
        vibe = response.choices[0].message.content.strip()
        return VibeResponse(vibe=vibe, source="ai")
    except Exception as e:
        logging.error(f"OpenAI error: {e}")
        return VibeResponse(
            vibe=f"Unable to generate vibe for {request.school_name}.",
            source="error"
        )

@app.post("/api/ai/portfolio", response_model=PortfolioResponse)
def analyze_portfolio(request: PortfolioRequest):
    """Analyze a list of saved colleges for balance"""
    logging.info(f"Portfolio Analysis: {len(request.colleges)} colleges")
    
    if len(request.colleges) == 0:
        return PortfolioResponse(
            analysis="Start by adding some colleges to your list!",
            recommendations=["Search for schools that match your profile"]
        )
    
    # Count tiers
    reach = sum(1 for c in request.colleges if c.get('tier') in ['S', 'A'])
    target = sum(1 for c in request.colleges if c.get('tier') == 'B')
    safety = sum(1 for c in request.colleges if c.get('tier') in ['C', 'D'])
    
    analysis = f"Your list: {reach} reach, {target} target, {safety} safety schools."
    recommendations = []
    
    if reach > 2 and safety == 0:
        recommendations.append("Add 1-2 safety schools with acceptance rates above 60%")
    if len(request.colleges) < 5:
        recommendations.append("Aim for 5-8 schools for a balanced list")
    if reach == 0 and len(request.colleges) > 3:
        recommendations.append("Consider adding a reach school if your stats allow")
    
    if not recommendations:
        recommendations.append("Your portfolio looks well-balanced!")
    
    return PortfolioResponse(analysis=analysis, recommendations=recommendations)

@app.post("/api/ai/chat", response_model=ChatResponse)
def ai_chat(request: ChatRequest):
    """General AI chat for onboarding and assistance"""
    logging.info(f"Chat: {request.message[:50]}...")
    
    client = get_openai_client()
    if not client:
        return ChatResponse(reply="AI chat is currently unavailable. Please check your API key.")
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.message}
            ],
            max_tokens=200,
            temperature=0.7
        )
        reply = response.choices[0].message.content.strip()
        return ChatResponse(reply=reply)
    except Exception as e:
        logging.error(f"Chat error: {e}")
        return ChatResponse(reply="I'm having trouble connecting. Please try again.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
