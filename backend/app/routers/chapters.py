"""
GET /chapters          → lista capítulos (filtra por access_level se sem JWT)
GET /chapters/{slug}   → capítulo individual
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from jose import jwt, JWTError

from app.models.schemas import Chapter
from app.core.config import get_settings

router = APIRouter(prefix="/chapters", tags=["chapters"])

# Dados locais de desenvolvimento — substituídos pelo Supabase em produção
DEV_CHAPTERS = [
    {
        "id": "ch-001",
        "title": "Prólogo: Entrando na Cidade do Medo",
        "slug": "prologo",
        "excerpt": '"Pede-me, e eu te darei os gentios por herança, e os fins da terra por tua possessão." — Salmos 2:8-12.',
        "access_level": "public",
        "order": 0,
    },
    {
        "id": "ch-002",
        "title": "Capítulo I — Why Can't You See The Funny Side?",
        "slug": "capitulo-i",
        "excerpt": '"E Adão pôs os nomes a todo o gado, e às aves dos céus, e a todo o animal do campo." — Gênesis 2:20',
        "access_level": "public",
        "order": 1,
    },
    {
        "id": "ch-003",
        "title": "Capítulo II — O Demônio Roubou a Minha Mulher",
        "slug": "capitulo-ii",
        "excerpt": "Melódico Mal Cantado Pseudo-Romântico.",
        "access_level": "public",
        "order": 2,
    },
    {
        "id": "ch-004",
        "title": "Capítulo III — Abandonai Toda a Esperança Vós que Entrais",
        "slug": "capitulo-iii",
        "excerpt": '"The oldest and strongest emotion is fear." — H. P. Lovecraft',
        "access_level": "restricted",
        "order": 3,
    },
    {
        "id": "ch-005",
        "title": "Interlúdio: A Voz do Sangue",
        "slug": "interludio-i",
        "excerpt": "Perspectivas dos não-nascidos.",
        "access_level": "restricted",
        "order": 4,
    },
]


def _get_access_level(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        return "public"
    token = authorization.split(" ", 1)[1]
    try:
        s = get_settings()
        payload = jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
        return payload.get("access_level", "public")
    except JWTError:
        return "public"


@router.get("", response_model=List[Chapter])
async def list_chapters(authorization: Optional[str] = Header(default=None)):
    access = _get_access_level(authorization)

    try:
        from app.core.supabase import get_supabase
        supabase = get_supabase()
    except Exception:
        supabase = None

    if supabase:
        query = supabase.table("chronicle_chapters").select("*").order("order")
        if access != "restricted":
            query = query.eq("access_level", "public")
        result = query.execute()
        return result.data or []

    # Modo dev: retorna dados locais
    if access == "restricted":
        return DEV_CHAPTERS
    return [c for c in DEV_CHAPTERS if c["access_level"] == "public"]


@router.get("/{slug}", response_model=Chapter)
async def get_chapter(slug: str, authorization: Optional[str] = Header(default=None)):
    access = _get_access_level(authorization)

    chapter = next((c for c in DEV_CHAPTERS if c["slug"] == slug), None)
    if not chapter:
        raise HTTPException(status_code=404, detail="Capítulo não encontrado.")
    if chapter["access_level"] == "restricted" and access != "restricted":
        raise HTTPException(status_code=403, detail="Acesso restrito.")

    return chapter
