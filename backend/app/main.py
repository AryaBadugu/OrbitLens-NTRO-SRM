import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import health, enhance, tiles

app = FastAPI(
    title="NTRO SRM API — Deep Learning Super Resolution Mapping",
    description="SIH 2026 PS 26142 — Sub-meter Satellite Super-Resolution with Swin2SR Transformer on local GPU.",
    version="2.0.0"
)

# Allow CORS for development dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(enhance.router)
app.include_router(tiles.router)

# Mount outputs directory
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=settings.OUTPUT_DIR), name="outputs")


@app.on_event("startup")
def startup_event():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.OUTPUT_DIR, exist_ok=True)


@app.get("/")
def root():
    return {
        "title": app.title,
        "organization": "National Technical Research Organisation (NTRO)",
        "problem_statement": "SIH 2026 - PS 26142",
        "model": "Swin2SR (caidas/swin2SR-classical-sr-x2-64)",
        "status": "online",
        "docs_url": "/docs"
    }
