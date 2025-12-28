from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logic
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Compass API", description="Backend for Compass HUD")

# Data Models
class MatchRequest(BaseModel):
    user_gpa: float
    target_career_soc: str
    user_budget: int

class SchoolScore(BaseModel):
    school_id: int
    school_name: str
    compass_score: int
    ranking: str
    debt_years: float | str
    net_price: Optional[int]
    earnings: Optional[int]
    debt: Optional[int]

class ClassOption(BaseModel):
    id: str
    name: str
    soc_codes: List[str]
    description: str

# Constants
CLASSES = [
    {
        "id": "engineer",
        "name": "Engineer",
        "soc_codes": ["17-0000", "15-0000"], # Arch/Eng, Computer
        "description": "Builders of the digital and physical world."
    },
    {
        "id": "healer",
        "name": "Healer",
        "soc_codes": ["29-0000"], # Healthcare Practitioners
        "description": "Guardians of health and vitality."
    },
    {
        "id": "leader",
        "name": "Leader",
        "soc_codes": ["11-0000", "13-0000"], # Management, Business
        "description": "Commanders of organizations and capital."
    },
    {
        "id": "creative",
        "name": "Creative",
        "soc_codes": ["27-0000"], # Arts, Design, Ent
        "description": "Attributes of culture and imagination."
    }
]

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/classes", response_model=List[ClassOption])
def get_classes():
    return CLASSES

@app.post("/match", response_model=List[SchoolScore])
def match_loadout(request: MatchRequest):
    logging.info(f"Match request: {request}")
    try:
        # logic.find_loadout returns dicts, need to ensure compatibility
        results = logic.find_loadout(request.user_gpa, request.target_career_soc, request.user_budget)
        return results
    except Exception as e:
        logging.error(f"Error in match_loadout: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
