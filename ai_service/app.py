from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Semantic Search API", description="API for semantic search of student forms")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 10

class SearchResult(BaseModel):
    id: str
    title: str
    content: str
    similarity_score: float
    form_type: str
    url: Optional[str] = None

# Routes
@app.get("/")
async def root():
    return {"message": "Semantic Search API is running"}

@app.post("/search", response_model=List[SearchResult])
async def semantic_search(query: SearchQuery):
    """
    Perform semantic search on student forms
    """
    try:
        # TODO: Implement actual semantic search logic
        # This is a placeholder response
        return [
            SearchResult(
                id="1",
                title="Student Registration Form",
                content="Form for registering new students for the semester",
                similarity_score=0.92,
                form_type="Registration",
                url="/forms/registration"
            ),
            SearchResult(
                id="2",
                title="Course Selection Form",
                content="Form for selecting courses for the upcoming semester",
                similarity_score=0.85,
                form_type="Academic",
                url="/forms/course-selection"
            )
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True) 