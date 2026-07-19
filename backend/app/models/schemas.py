from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, constr


# ─── Auth ─────────────────────────────────────────────────────────────────────
class ValidateKeyRequest(BaseModel):
    key: constr(strip_whitespace=True, min_length=4, max_length=128)


class ValidateKeyResponse(BaseModel):
    ok: bool
    token: Optional[str] = Field(default=None)


# ─── Capítulos ────────────────────────────────────────────────────────────────
class Chapter(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    content: Optional[str] = Field(default=None)
    access_level: str
    order: int
    created_at: Optional[str] = Field(default=None)
    updated_at: Optional[str] = Field(default=None)


# ─── Personagens ──────────────────────────────────────────────────────────────
class Character(BaseModel):
    id: str
    name: str
    concept: Optional[str] = Field(default=None)
    clan: Optional[str] = Field(default=None)
    generation: Optional[int] = Field(default=None)
    sheet_data: Dict[str, Any] = Field(default_factory=dict)
    access_level: str


# ─── Anotações ────────────────────────────────────────────────────────────────
class AnnotationUpsert(BaseModel):
    content: constr(strip_whitespace=True, min_length=1, max_length=20000)
    updated_at: Optional[datetime] = Field(default=None)


class AnnotationResponse(BaseModel):
    id: str
    character_id: str
    content: str
    updated_at: str
