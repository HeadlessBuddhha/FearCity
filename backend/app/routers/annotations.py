"""
GET  /annotations/{character_id}
POST /annotations/{character_id}

Em dev: armazena em memória (reinicia ao parar o servidor).
Em prod: persiste no Supabase.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from jose import jwt, JWTError
from datetime import datetime, timezone

from app.models.schemas import AnnotationUpsert, AnnotationResponse
from app.core.config import get_settings

router = APIRouter(prefix="/annotations", tags=["annotations"])

# Store em memória para desenvolvimento
_dev_store: dict = {}


def _require_auth(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Autenticação necessária.")
    token = authorization.split(" ", 1)[1]
    try:
        s = get_settings()
        payload = jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
        if payload.get("access_level") != "restricted":
            raise HTTPException(status_code=403, detail="Acesso insuficiente.")
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")


@router.get("/{character_id}", response_model=AnnotationResponse)
async def get_annotation(character_id: str, authorization: Optional[str] = Header(default=None)):
    _require_auth(authorization)

    if character_id in _dev_store:
        return _dev_store[character_id]

    raise HTTPException(status_code=404, detail="Anotação não encontrada.")


@router.post("/{character_id}", response_model=AnnotationResponse)
async def upsert_annotation(
    character_id: str,
    body: AnnotationUpsert,
    authorization: Optional[str] = Header(default=None),
):
    _require_auth(authorization)

    now = body.updated_at or datetime.now(timezone.utc).isoformat()
    record = {
        "id": f"ann_{character_id}",
        "character_id": character_id,
        "content": body.content,
        "updated_at": now,
    }

    try:
        from app.core.supabase import get_supabase
        supabase = get_supabase()
    except Exception:
        supabase = None

    if supabase:
        result = (
            supabase.table("annotations")
            .upsert({"character_id": character_id, "content": body.content, "updated_at": now},
                    on_conflict="character_id")
            .execute()
        )
        return result.data[0]

    # Modo dev: salva em memória
    _dev_store[character_id] = record
    return record
