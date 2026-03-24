from fastapi import FastAPI, Request # type: ignore
from fastapi.responses import JSONResponse # type: ignore
from sqlalchemy.exc import IntegrityError # type: ignore
from database import engine # type: ignore
import models # type: ignore
import routes # type: ignore

models.Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware # type: ignore

app = FastAPI(title="Finance Tracker Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(IntegrityError)
async def sqlalchemy_integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=400,
        content={"success": False, "data": {"error": "Database integrity constraint violated."}}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "data": {"error": f"Internal Server Error: {str(exc)}"}}
    )

app.include_router(routes.router)

@app.get("/")
def root():
    return {"message": "Welcome to Personal Finance Management System Backend"}
