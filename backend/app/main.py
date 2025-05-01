from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
from typing import Optional, List, Dict, Any
import uvicorn

# Import routers
from app.routers import grading, rubric

app = FastAPI(
    title="AI Assignment Grader API",
    description="API for grading assignments using AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(grading.router, prefix="/api/grading", tags=["Grading"])
app.include_router(rubric.router, prefix="/api/rubric", tags=["Rubric Analysis"])

@app.get("/")
async def root():
    """Root endpoint to verify API is running"""
    return {"message": "AI Assignment Grader API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True) 