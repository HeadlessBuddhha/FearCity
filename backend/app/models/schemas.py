from pydantic import BaseModel
from typing import Optional, Literal, Dict, Any
from datetime import datetime


# ─── Auth ─────────────────────────────────────────────────────────────────────
class ValidateKeyRequest(BaseModel):
    key: str


class ValidateKeyResponse(BaseModel):
    ok: bool
    token: Optional[str] = None


# ─── Capítulos ────────────────────────────────────────────────────────────────
class Chapter(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    content: Optional[str] = None
    access_level: str
    order: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ─── Personagens ──────────────────────────────────────────────────────────────
class Character(BaseModel):
    id: str
    name: str
    concept: Optional[str] = None
    clan: Optional[str] = None
    generation: Optional[int] = None
    sheet_data: Dict[str, Any] = {}
    access_level: str


# ─── Anotações ────────────────────────────────────────────────────────────────
class AnnotationUpsert(BaseModel):
    content: str
    updated_at: Optional[str] = None


class AnnotationResponse(BaseModel):
    id: str
    character_id: str
    content: str
    updated_at: str
