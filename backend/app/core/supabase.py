# Supabase client — só instanciado quando as credenciais reais estiverem no .env
# Em modo dev local, o backend funciona sem Supabase (chave validada localmente)

_client = None

def get_supabase():
    global _client
    if _client is not None:
        return _client
    try:
        from supabase import create_client
        from app.core.config import get_settings
        s = get_settings()
        if s.supabase_url == "http://localhost":
            return None   # modo dev, sem Supabase
        _client = create_client(s.supabase_url, s.supabase_service_key)
        return _client
    except Exception:
        return None
