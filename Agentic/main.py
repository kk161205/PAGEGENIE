# Import necessary libraries
import os
import regex
import sys
import json
import base64
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Generator
from dotenv import load_dotenv
from logger_config import setup_logger
from utils import call_agent_query_async, create_session, retrieve_session, create_runner
from google.adk.sessions import InMemorySessionService

# Importing the agents
from agents import Base

# Load the .env file
load_dotenv()

# Default User
APP_NAME = os.getenv("APP_NAME")
USER_ID = "user_1"
SESSION_ID = "session_001"

# Configure logging
logging = setup_logger("orion_logs")

# Session configuration
session_service_memory = InMemorySessionService()

session_service = session_service_memory

# ------------------ Global runner ------------------
runner = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ------------------ Initialize session and runner ------------------
    global runner
    session = await retrieve_session(
        session_service=session_service,
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID,
        logging=logging
    )

    if not session:
        session = await create_session(
            session_service=session_service,
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=SESSION_ID,
            logging=logging,
            state={
                "details":  {
                    "Page Purpose": None,
                    "Content": None,
                    "Layout & Styling": None, 
                    "Images": None, 
                    "External Resources": None, 
                    "Simple Interactivity": None
                },
                "problem_config":   {    
                    #Mandatory keys 
                    "Page Title": None, 
                    "Main Content": None, 
                    "Page Structure": None, 
                    "Navigation Menu": None, 
                    "Primary Media": None,

                    #Optional keys 
                    "Meta Description": None, 
                    "Keywords": None, 
                    "Favicon": None, 
                    "Secondary Content": None, 
                    "Footer Content": None,
                    "External Scripts": None,
                    "Custom Fonts": None, 
                    "Accessibility Attributes": None, 
                    "Social Sharing Metadata": None, 
                    "Forms": None, 
                    "Animations / Effects": None
                },
                "web_info_output": None,
                "section_plan": {},
                "generated_code": None,
                "instruct": None
        }
    )

    runner = await create_runner(
        agent=Base,
        app_name=APP_NAME,
        session_service=session_service,
        logging=logging
    )

    logging.info("Session and runner initialized successfully")

    try:
        yield  # the app runs here
    finally:
        # Optional: cleanup if needed
        logging.info("Lifespan ending, cleaning up resources...")

# Server configuration
app = FastAPI(lifespan=lifespan)

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

###################################################################################
# Importing routes

# Home Route
@app.get("/")
async def root():
    return {"message": f"Server is running at port: {os.getenv("PORT", 8000)}!"}

    # Request body model
class PromptRequest(BaseModel):
    prompt: str


@app.post("/agent/query")
async def agent_query(request: PromptRequest):
    try:
        response = await call_agent_query_async(
            query=request.prompt,
            runner=runner,
            user_id=USER_ID,
            session_id=SESSION_ID,
            logging=logging
        )       
        return {"status": "success", "response": response}
    except Exception as e:
        logging.error(f"Agent query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)