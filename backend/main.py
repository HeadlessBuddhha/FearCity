"""
main.py — Fear City API
Roda localmente sem Supabase: chave = CHAVE_SECRETA_2024
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, chapters, annotations

app = FastAPI(
    title="Fear City API",
    description="Backend da Crônica Fear City — Vampiro: A Máscara",
    version="1.0.0",
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(chapters.router)
app.include_router(annotations.router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "project": "Fear City API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
