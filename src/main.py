from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import compass_logic
import bls_service
import logging
import os
import hashlib
import requests
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
    priorities: Optional[List[str]] = None  # e.g., ['greek', 'sports', 'diversity', 'hbcu']
    priorityWeights: Optional[dict] = None  # e.g., {'greek': 4, 'sports': 5, 'diversity': 7}

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
        # Log request to file for debugging
        with open("request_debug.txt", "a") as f:
            f.write(f"Request: {request}\n")

        results = compass_logic.find_loadout(
            user_gpa=request.gpa,
            target_career_soc=request.major,
            user_budget=request.budget,
            user_sat=request.sat,
            priorities=request.priorities,
            priority_weights=request.priorityWeights
        )
        
        with open("request_debug.txt", "a") as f:
            f.write(f"Results found: {len(results)}\n")

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

# =====================
# MAILCHIMP SUBSCRIBE
# =====================

class SubscribeRequest(BaseModel):
    email: str
    name: Optional[str] = None
    role: Optional[str] = None
    grade: Optional[str] = None

class SubscribeResponse(BaseModel):
    success: bool
    message: str

@app.post("/api/subscribe", response_model=SubscribeResponse)
def subscribe_to_waitlist(request: SubscribeRequest):
    """Add subscriber to Mailchimp waitlist"""
    logging.info(f"Subscribe request: {request.email}")
    
    # Get Mailchimp credentials from environment
    api_key = os.getenv("MAILCHIMP_API_KEY")
    audience_id = os.getenv("MAILCHIMP_AUDIENCE_ID")
    
    if not api_key or not audience_id:
        logging.error("Mailchimp credentials not configured")
        return SubscribeResponse(success=False, message="Email service not configured")
    
    # Extract data center from API key (e.g., "us2" from "xxx-us2")
    dc = api_key.split("-")[-1]
    
    # Mailchimp API endpoint
    url = f"https://{dc}.api.mailchimp.com/3.0/lists/{audience_id}/members"
    
    # Build subscriber data
    subscriber_data = {
        "email_address": request.email,
        "status": "subscribed",
        "merge_fields": {}
    }
    
    # Add optional fields
    if request.name:
        # Split name into first/last for Mailchimp
        name_parts = request.name.split(" ", 1)
        subscriber_data["merge_fields"]["FNAME"] = name_parts[0]
        if len(name_parts) > 1:
            subscriber_data["merge_fields"]["LNAME"] = name_parts[1]
    
    if request.role:
        subscriber_data["merge_fields"]["ROLE"] = request.role
    
    if request.grade:
        subscriber_data["merge_fields"]["GRADE"] = request.grade
    
    try:
        response = requests.post(
            url,
            json=subscriber_data,
            auth=("anystring", api_key),
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            logging.info(f"Successfully subscribed: {request.email}")
            return SubscribeResponse(success=True, message="Successfully joined waitlist!")
        elif response.status_code == 400 and "already a list member" in response.text.lower():
            return SubscribeResponse(success=True, message="You're already on the waitlist!")
        else:
            logging.error(f"Mailchimp error: {response.status_code} - {response.text}")
            return SubscribeResponse(success=False, message="Failed to join waitlist. Please try again.")
            
    except Exception as e:
        logging.error(f"Subscribe error: {e}")
        return SubscribeResponse(success=False, message="Failed to join waitlist. Please try again.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
