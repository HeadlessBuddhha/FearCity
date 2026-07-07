/**
 * annotations.js — Anotações local-first com sync em background
 * Equivalente ao use-annotation-sync.ts (sem React hooks)
 *
 * Padrão: escreve no localStorage imediatamente →
 *         debounce 2s → POST /annotations/{characterId} no FastAPI
 */

class AnnotationSync {
  constructor(characterId) {
    this.characterId = characterId;
    this.storageKey  = CONFIG.STORAGE.ANNOTATION(characterId);
    this._debounce   = null;
    this._listeners  = [];

    // Carregar estado inicial
    this.state = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : this._empty();
    } catch {
      return this._empty();
    }
  }

  _empty() {
    return {
      id:          `local_${this.characterId}`,
      characterId: this.characterId,
      content:     '',
      updatedAt:   new Date().toISOString(),
      syncStatus:  'synced',
    };
  }

  _setState(partial) {
    this.state = { ...this.state, ...partial };
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this._notify();
  }

  _notify() {
    this._listeners.forEach(fn => fn(this.state));
  }

  /** Registra callback para mudanças de estado */
  onChange(fn) {
    this._listeners.push(fn);
    fn(this.state); // disparo imediato com estado atual
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }

  /** Atualiza conteúdo localmente e agenda sync com backend */
  update(content) {
    this._setState({
      content,
      updatedAt:  new Date().toISOString(),
      syncStatus: 'pending',
    });

    if (this._debounce) clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this._syncToBackend(), 2000);
  }

  async _syncToBackend() {
    const session = Access.getSession();
    if (!session.isAuthenticated) return; // sem auth, não sincroniza

    try {
      const res = await fetch(
        `${CONFIG.ENDPOINTS.ANNOTATIONS}/${this.characterId}`,
        {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session.token ? { 'Authorization': `Bearer ${session.token}` } : {}),
          },
          body: JSON.stringify({
            content:    this.state.content,
            updated_at: this.state.updatedAt,
          }),
        }
      );

      if (res.ok) {
        this._setState({ syncStatus: 'synced' });
      } else {
        this._setState({ syncStatus: 'error' });
      }
    } catch (err) {
      console.error('[Annotations] Falha no sync:', err);
      this._setState({ syncStatus: 'error' });
    }
  }

  destroy() {
    if (this._debounce) clearTimeout(this._debounce);
    this._listeners = [];
  }
}
