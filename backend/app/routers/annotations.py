"""
GET  /annotations/{character_id}
POST /annotations/{character_id}

Em dev: armazena em memória (reinicia ao parar o servidor).
Em prod: persiste no Supabase.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException
from jose import JWTError, jwt

from app.core.config import get_settings
from app.models.schemas import AnnotationResponse, AnnotationUpsert

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
        user_id = payload.get("user_id") or payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=403, detail="Identidade do usuário ausente.")
        return str(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")


@router.get("/{character_id}", response_model=AnnotationResponse)
async def get_annotation(character_id: str, authorization: Optional[str] = Header(default=None)):
    user_id = _require_auth(authorization)

    if character_id in _dev_store:
        record = _dev_store[character_id]
        if record.get("user_id") != user_id:
            raise HTTPException(status_code=404, detail="Anotação não encontrada.")
        return record

    try:
        from app.core.supabase import get_supabase

        supabase = get_supabase()
    except Exception:
        supabase = None

    if supabase:
        try:
            result = (
                supabase.table("annotations")
                .select("id, character_id, content, updated_at")
                .eq("user_id", user_id)
                .eq("character_id", character_id)
                .maybe_single()
                .execute()
            )
        except Exception:
            raise HTTPException(status_code=503, detail="Erro ao consultar banco de dados.")

        if result.data:
            return result.data
        raise HTTPException(status_code=404, detail="Anotação não encontrada.")

    raise HTTPException(status_code=404, detail="Anotação não encontrada.")


@router.post("/{character_id}", response_model=AnnotationResponse)
async def upsert_annotation(
    character_id: str,
    body: AnnotationUpsert,
    authorization: Optional[str] = Header(default=None),
):
    user_id = _require_auth(authorization)

    updated_at = body.updated_at or datetime.now(timezone.utc)
    now = updated_at.isoformat() if isinstance(updated_at, datetime) else str(updated_at)

    record = {
        "id": f"ann_{character_id}",
        "character_id": character_id,
        "content": body.content,
        "updated_at": now,
        "user_id": user_id,
    }

    try:
        from app.core.supabase import get_supabase

        supabase = get_supabase()
    except Exception:
        supabase = None

    if supabase:
        payload = {
            "character_id": character_id,
            "user_id": user_id,
            "content": body.content,
            "updated_at": now,
        }

        try:
            result = (
                supabase.table("annotations")
                .upsert(payload, on_conflict="user_id,character_id")
                .execute()
            )
        except Exception:
            raise HTTPException(status_code=503, detail="Erro ao salvar anotação no banco de dados.")

        if result.data:
            return result.data[0]

        raise HTTPException(status_code=503, detail="Erro ao salvar anotação no banco de dados.")

    _dev_store[character_id] = record
    return record
