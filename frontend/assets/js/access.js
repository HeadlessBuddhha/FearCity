/**
 * access.js — Controle de sessão e validação de chave
 * Equivalente ao access-context.tsx (sem React)
 *
 * Fluxo:
 *  1. Lê sessão do localStorage na inicialização
 *  2. Para unlock(): POST /auth/validate-key → FastAPI → Supabase
 *  3. Persiste sessão no localStorage após sucesso
 *  4. Dispara evento customizado 'sessionchange' para atualizar a UI
 */

const Access = (() => {
  // ─── Estado interno ─────────────────────────────────────────────────────
  let _session = _loadSession();

  function _loadSession() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE.SESSION);
      return raw ? JSON.parse(raw) : { isAuthenticated: false, accessLevel: 'public' };
    } catch {
      return { isAuthenticated: false, accessLevel: 'public' };
    }
  }

  function _saveSession(session) {
    _session = session;
    localStorage.setItem(CONFIG.STORAGE.SESSION, JSON.stringify(session));
    // Notifica todos os componentes que ouvirem este evento
    window.dispatchEvent(new CustomEvent('sessionchange', { detail: session }));
  }

  // ─── API pública ─────────────────────────────────────────────────────────

  /** Retorna a sessão atual */
  function getSession() {
    return { ..._session };
  }

  /** Verifica se o nível de acesso é suficiente */
  function hasAccess(level) {
    if (level === 'public') return true;
    return _session.accessLevel === 'restricted';
  }

  /**
   * Envia a chave para o FastAPI validar contra o Supabase.
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async function unlock(key) {
    try {
      const res = await fetch(CONFIG.ENDPOINTS.VALIDATE_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        const data = await res.json();
        _saveSession({
          isAuthenticated: true,
          accessLevel: 'restricted',
          token: data.token || null,   // JWT opcional para futuras chamadas
        });
        return { ok: true };
      }

      if (res.status === 401) {
        return { ok: false, error: 'Chave inválida. O sangue não reconhece este selo.' };
      }

      return { ok: false, error: 'Erro ao verificar a chave. Tente novamente.' };

    } catch (err) {
      console.error('[Access] Falha na requisição:', err);
      return { ok: false, error: 'Sem conexão com o servidor. Tente novamente.' };
    }
  }

  /** Remove a sessão */
  function lock() {
    localStorage.removeItem(CONFIG.STORAGE.SESSION);
    _saveSession({ isAuthenticated: false, accessLevel: 'public' });
  }

  return { getSession, hasAccess, unlock, lock };
})();
