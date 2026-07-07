/**
 * header.js — Header dinâmico, menu mobile e modal de chave de acesso
 * Equivalente a site-header.tsx + access-key-modal.tsx (sem React)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Injetar Header ──────────────────────────────────────────────────────
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    headerEl.innerHTML = buildHeader();
    initHeader();
    initModal();
  }

  // ─── Injetar Footer ──────────────────────────────────────────────────────
  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.innerHTML = buildFooter();
  }

  // ─── Atualizar UI quando a sessão mudar ──────────────────────────────────
  window.addEventListener('sessionchange', () => {
    updateAuthUI();
    // Força re-render das partes protegidas da página
    window.dispatchEvent(new CustomEvent('accesschanged'));
  });
});

// ─── Templates ─────────────────────────────────────────────────────────────

function buildHeader() {
  return `
    <div class="header-top-line"></div>
    <div class="header-inner">
      <a href="/" class="site-logo">
        <span class="site-logo-symbol animate-flicker">✦</span>
        <span class="site-logo-text">Fear City</span>
      </a>

      <nav class="header-nav" id="desktop-nav">
        <a href="/" class="nav-item" data-page="home">Início</a>
        <a href="/pages/chronicle.html" class="nav-item" data-page="chronicle">Crônica</a>
        <a href="/pages/characters.html" class="nav-item" data-page="characters">
          Personagens <span style="color:var(--blood-600);font-size:0.7rem">🔒</span>
        </a>
        <a href="/pages/media.html" class="nav-item" data-page="media">Vídeos</a>
      </nav>

      <div class="header-actions" id="header-auth">
        <!-- preenchido por updateAuthUI() -->
      </div>

      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="mobile-nav container" id="mobile-nav">
      <a href="/" class="nav-item" data-page="home">Início</a>
      <a href="/pages/chronicle.html" class="nav-item" data-page="chronicle">Crônica</a>
      <a href="/pages/characters.html" class="nav-item" data-page="characters">Personagens 🔒</a>
      <a href="/pages/media.html" class="nav-item" data-page="media">Vídeos</a>
      <div id="mobile-auth" style="padding-top:0.5rem"></div>
    </div>
    <div class="header-bottom-line"></div>

    <!-- Modal de chave de acesso -->
    <div class="modal-backdrop" id="key-modal">
      <div class="modal-box">
        <div class="modal-corner tl"></div>
        <div class="modal-corner tr"></div>
        <div class="modal-corner bl"></div>
        <div class="modal-corner br"></div>
        <div class="modal-inner">
          <div class="modal-header">
            <div class="modal-icon animate-pulse-slow">🗝</div>
            <h2 class="modal-title font-cinzel">Acesso Restrito</h2>
            <div class="ornament-divider"><span class="font-cinzel" style="color:var(--blood-700);font-size:0.75rem">✦</span></div>
            <p class="modal-subtitle">Alguns segredos da noite exigem um preço para serem revelados.</p>
          </div>
          <div class="modal-field">
            <label class="modal-label" for="key-input">Chave de Acesso</label>
            <input
              id="key-input"
              type="password"
              class="input-dark modal-input"
              placeholder="············"
              autocomplete="off"
            />
            <p class="modal-error" id="key-error"></p>
          </div>
          <div class="modal-actions">
            <button class="btn-ghost" id="modal-cancel">Recuar</button>
            <button class="btn-primary" id="modal-submit">Entrar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildFooter() {
  return `
    <div class="footer-top-line"></div>
    <div class="footer-inner">
      <div class="footer-logo">
        <span class="footer-logo-symbol">✦</span>
        <span class="footer-logo-text">Fear City · Crônica das Trevas</span>
      </div>
      <p class="footer-copy">
        Uso interno da mesa · Baseado em
        <em>Vampiro: A Máscara</em>
      </p>
    </div>
  `;
}

// ─── Inicialização ──────────────────────────────────────────────────────────

function initHeader() {
  // Marcar nav item ativo baseado na URL atual
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    const page = el.dataset.page;
    const isActive =
      (page === 'home'       && (path === '/' || path.endsWith('index.html'))) ||
      (page === 'chronicle'  && path.includes('chronicle')) ||
      (page === 'characters' && path.includes('characters')) ||
      (page === 'media'      && path.includes('media'));
    if (isActive) el.classList.add('active');
  });

  // Menu hambúrguer
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  updateAuthUI();
}

function updateAuthUI() {
  const session = Access.getSession();
  const desktopAuth = document.getElementById('header-auth');
  const mobileAuth  = document.getElementById('mobile-auth');
  if (!desktopAuth) return;

  if (session.isAuthenticated) {
    const html = `
      <span class="auth-status">✓ Acesso concedido</span>
      <button class="btn-logout" id="btn-logout">Sair</button>
    `;
    desktopAuth.innerHTML = html;
    if (mobileAuth) mobileAuth.innerHTML = html;
    document.getElementById('btn-logout')?.addEventListener('click', () => Access.lock());
    document.querySelectorAll('[id="btn-logout"]').forEach(btn =>
      btn.addEventListener('click', () => Access.lock())
    );
  } else {
    const html = `<button class="btn-ghost" id="btn-open-modal" style="font-size:0.75rem;padding:0.375rem 0.75rem">🗝 Usar Chave</button>`;
    desktopAuth.innerHTML = html;
    if (mobileAuth) mobileAuth.innerHTML = html;
    document.querySelectorAll('#btn-open-modal').forEach(btn =>
      btn.addEventListener('click', openModal)
    );
  }
}

// ─── Modal ──────────────────────────────────────────────────────────────────

function initModal() {
  const modal    = document.getElementById('key-modal');
  const input    = document.getElementById('key-input');
  const errorEl  = document.getElementById('key-error');
  const btnSubmit = document.getElementById('modal-submit');
  const btnCancel = document.getElementById('modal-cancel');

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  btnCancel?.addEventListener('click', closeModal);
  btnSubmit?.addEventListener('click', submitKey);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitKey();
  });

  async function submitKey() {
    const key = input.value.trim();
    if (!key) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Verificando...';
    errorEl.classList.remove('visible');

    // Delay dramático 🧛
    await new Promise(r => setTimeout(r, 600));

    const result = await Access.unlock(key);

    if (result.ok) {
      closeModal();
    } else {
      errorEl.textContent = result.error;
      errorEl.classList.add('visible');
      input.value = '';
      input.focus();
    }

    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Entrar';
  }
}

function openModal() {
  const modal = document.getElementById('key-modal');
  const input = document.getElementById('key-input');
  const errorEl = document.getElementById('key-error');
  if (!modal) return;
  modal.classList.add('open');
  if (errorEl) errorEl.classList.remove('visible');
  if (input) { input.value = ''; setTimeout(() => input.focus(), 100); }
}

function closeModal() {
  document.getElementById('key-modal')?.classList.remove('open');
}

// Expor openModal globalmente para botões de páginas internas
window.openAccessModal = openModal;

// ─── Componente reutilizável: conteúdo bloqueado ─────────────────────────────
/**
 * Gera o HTML do bloco de conteúdo bloqueado.
 * Uso: element.innerHTML = LockedContent('Fichas de Personagem')
 */
function LockedContent(label = 'Conteúdo Restrito') {
  return `
    <div class="locked-content">
      <div class="locked-placeholder">
        <span style="width:75%"></span>
        <span style="width:100%"></span>
        <span style="width:83%"></span>
        <span style="width:66%"></span>
      </div>
      <div class="locked-overlay">
        <div class="locked-icon">🔒</div>
        <p class="locked-label font-cinzel">${label}</p>
        <p class="locked-hint">Este segredo está selado.</p>
        <button class="btn-primary" onclick="window.openAccessModal()" style="font-size:0.75rem;padding:0.5rem 1rem">
          🗝 Usar Chave
        </button>
      </div>
    </div>
  `;
}

window.LockedContent = LockedContent;
