"""
POST /auth/validate-key

Modo dev  → compara direto com dev_access_key do .env (sem Supabase)
Modo prod → faz hash SHA-256 e consulta tabela access_keys no Supabase
"""

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from jose import jwt

from app.core.config import get_settings
from app.models.schemas import ValidateKeyRequest, ValidateKeyResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def _create_jwt(settings, user_id: str) -> str:
    if not settings.jwt_secret:
        raise HTTPException(status_code=500, detail="JWT secret não configurada.")

    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": user_id,
        "user_id": user_id,
        "access_level": "restricted",
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.post("/validate-key", response_model=ValidateKeyResponse)
async def validate_key(body: ValidateKeyRequest):
    settings = get_settings()
    key = body.key.strip()

    # ── Modo dev: valida localmente sem Supabase ──────────────────────────────
    supabase = None
    try:
        from app.core.supabase import get_supabase
        supabase = get_supabase()
    except Exception:
        pass

    if supabase is None:
        if settings.dev_access_key and key == settings.dev_access_key:
            return ValidateKeyResponse(ok=True, token=_create_jwt(settings, "dev-user"))
        raise HTTPException(status_code=401, detail="Chave inválida.")

    # ── Modo prod: consulta Supabase ──────────────────────────────────────────
    if not settings.supabase_service_key:
        raise HTTPException(status_code=503, detail="Configuração do Supabase ausente.")

    key_hash = _hash_key(key)
    try:
        result = (
            supabase.table("access_keys")
            .select("id, is_active, expires_at, user_id")
            .eq("key_hash", key_hash)
            .eq("is_active", True)
            .maybe_single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Erro ao consultar banco de dados.")

    if not result.data:
        raise HTTPException(status_code=401, detail="Chave inválida.")

    expires_at = result.data.get("expires_at")
    if expires_at:
        exp_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if exp_dt < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Chave expirada.")

    user_id = result.data.get("user_id") or result.data.get("id")
    return ValidateKeyResponse(ok=True, token=_create_jwt(settings, str(user_id)))
