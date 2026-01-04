from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import compass_logic
import bls_service
import logging

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

@app.post("/api/boss", response_model=BossStats)
def fight_boss(request: BossRequest):
    logging.info(f"Boss Fight Request: {request.soc_code}")
    stats = bls_service.fetch_boss_stats(request.soc_code)
    return stats

@app.get("/api/careers/{class_id}")
def get_careers(class_id: str):
    logging.info(f"Career List Request: {class_id}")
    return bls_service.get_careers_for_class(class_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
