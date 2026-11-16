/**
 * characters.js — Fichas de personagem com anotações sincronizadas
 *
 * FOTO: coloque o arquivo em assets/images/personagens/<id>.jpg
 * Quando integrar Supabase, substitua o campo `photo` pelo URL do Storage.
 */

const MOCK_CHARACTERS = [
  {
    id:        'char-001',
    name:      'Valentina Greco',
    concept:   'Advogada que descobriu o mundo oculto',
    clan:      'Toreador',
    generation: 11,
    nature:    'Arquiteta',
    demeanor:  'Bon Vivant',
    haven:     'Apartamento no centro histórico',
    // Caminho local agora; URL do Supabase Storage depois
    photo:     '/assets/images/personagens/valentina.jpg',
    attributes: {
      physical: [
        { name: 'Força',    value: 2, max: 5 },
        { name: 'Destreza', value: 3, max: 5 },
        { name: 'Vigor',    value: 2, max: 5 },
      ],
      social: [
        { name: 'Carisma',     value: 4, max: 5 },
        { name: 'Manipulação', value: 3, max: 5 },
        { name: 'Aparência',   value: 4, max: 5 },
      ],
      mental: [
        { name: 'Percepção',    value: 3, max: 5 },
        { name: 'Inteligência', value: 3, max: 5 },
        { name: 'Raciocínio',   value: 2, max: 5 },
      ],
    },
    disciplines: [
      { name: 'Presença',  level: 2 },
      { name: 'Auspícios', level: 1 },
    ],
    bloodPool:  { current: 8, max: 12 },
    willpower:  { current: 6, max: 7  },
    humanity:   7,
  },
  // Adicione mais personagens aqui seguindo o mesmo formato
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dots(value, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span class="dot ${i < value ? 'filled' : 'empty'}"></span>`
  ).join('');
}

function poolBar(current, max, type) {
  const pct = Math.round((current / max) * 100);
  return `
    <div class="pool-bar-bg">
      <div class="pool-bar-fill ${type}" style="width:${pct}%"></div>
    </div>`;
}

function attrSection(label, attrs) {
  return `
    <div class="chronicle-card p-4">
      <h3 class="attr-section-title font-cinzel">${label}</h3>
      ${attrs.map(a => `
        <div class="attr-row">
          <span class="attr-name">${a.name}</span>
          <div class="attr-dots">${dots(a.value, a.max)}</div>
        </div>
      `).join('')}
    </div>`;
}

// ─── Render da ficha ──────────────────────────────────────────────────────────

function renderSheet(char) {
  const photoHtml = char.photo
    ? `<img src="${char.photo}"
            alt="Foto de ${char.name}"
            class="char-photo"
            onerror="this.parentElement.innerHTML='<div class=\\'char-photo-placeholder\\'>🧛</div>'"
       />`
    : `<div class="char-photo-placeholder">🧛</div>`;

  return `
    <div class="space-y-8 animate-fade-in">

      <!-- Cabeçalho: foto + dados principais -->
      <div class="chronicle-card corner-ornament p-6">
        <div class="char-header">

          <div class="char-photo-wrap">
            ${photoHtml}
          </div>

          <div class="char-header-info">
            <div class="sheet-grid-2">
              <div class="sheet-field">
                <p class="sheet-label font-mono">Nome</p>
                <p class="sheet-value-name font-cinzel">${char.name}</p>
              </div>
              <div class="sheet-field">
                <p class="sheet-label font-mono">Clã</p>
                <p class="sheet-value-clan font-cinzel">${char.clan}</p>
              </div>
              <div class="sheet-field">
                <p class="sheet-label font-mono">Conceito</p>
                <p class="sheet-value-text">${char.concept}</p>
              </div>
              <div class="sheet-field">
                <p class="sheet-label font-mono">Geração</p>
                <p class="sheet-value-gen font-cinzel">${char.generation}ª</p>
              </div>
              <div class="sheet-field">
                <p class="sheet-label font-mono">Natureza</p>
                <p class="sheet-value-text">${char.nature || '—'}</p>
              </div>
              <div class="sheet-field">
                <p class="sheet-label font-mono">Comportamento</p>
                <p class="sheet-value-text">${char.demeanor || '—'}</p>
              </div>
              <div class="sheet-field" style="grid-column:1/-1">
                <p class="sheet-label font-mono">Refúgio</p>
                <p class="sheet-value-text">${char.haven || '—'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Atributos -->
      <div class="sheet-grid-3">
        ${attrSection('Físico', char.attributes.physical)}
        ${attrSection('Social', char.attributes.social)}
        ${attrSection('Mental', char.attributes.mental)}
      </div>

      <!-- Disciplinas + Reservas -->
      <div class="sheet-grid-2">
        <div class="chronicle-card p-4">
          <h3 class="attr-section-title font-cinzel">Disciplinas</h3>
          ${char.disciplines.map(d => `
            <div class="attr-row">
              <span class="attr-name">${d.name}</span>
              <div class="attr-dots">${dots(d.level)}</div>
            </div>
          `).join('')}
        </div>

        <div class="chronicle-card p-4">
          <h3 class="attr-section-title font-cinzel">Reservas</h3>
          <div class="pool-bar-wrap">
            <div class="pool-bar-header">
              <span class="pool-bar-label">Reserva de Sangue</span>
              <span class="pool-bar-value-blood">
                ${char.bloodPool.current}/${char.bloodPool.max}
              </span>
            </div>
            ${poolBar(char.bloodPool.current, char.bloodPool.max, 'blood')}
          </div>
          <div class="pool-bar-wrap">
            <div class="pool-bar-header">
              <span class="pool-bar-label">Força de Vontade</span>
              <span class="pool-bar-value-will">
                ${char.willpower.current}/${char.willpower.max}
              </span>
            </div>
            ${poolBar(char.willpower.current, char.willpower.max, 'will')}
          </div>
          <div class="attr-row" style="margin-top:0.75rem">
            <span class="attr-name">Humanidade</span>
            <div class="attr-dots">${dots(char.humanity)}</div>
          </div>
        </div>
      </div>

      <!-- Anotações -->
      <div class="chronicle-card p-4" id="annotations-section">
        <div class="annotations-header">
          <h3 class="attr-section-title font-cinzel" style="margin-bottom:0">
            Anotações Pessoais
          </h3>
          <span class="sync-status synced" id="sync-status">✓ Sincronizado</span>
        </div>
        <textarea
          id="annotations-textarea"
          class="input-dark"
          style="min-height:140px;resize:vertical;margin-top:0.75rem"
          placeholder="Suas notas sobre a sessão, pistas encontradas, NPCs conhecidos..."
        ></textarea>
        <p class="annotations-hint">
          Salvo localmente · Sincroniza com a nuvem automaticamente
        </p>
      </div>

    </div>
  `;
}

// ─── Seletor de personagem (quando houver múltiplos) ─────────────────────────

function renderSelector(characters) {
  return `
    <div class="char-selector mb-6">
      ${characters.map(c => `
        <button
          class="char-selector-btn font-cinzel"
          data-id="${c.id}"
          onclick="selectCharacter('${c.id}')"
        >
          ${c.name}
          <span class="char-selector-clan">${c.clan}</span>
        </button>
      `).join('')}
    </div>
  `;
}

// ─── Render bloqueado ─────────────────────────────────────────────────────────

function renderLocked() {
  return `
    <div style="max-width:32rem;margin:0 auto">
      ${LockedContent('Fichas de Personagem — Acesso Restrito')}
      <p class="lore-text" style="text-align:center;margin-top:1.5rem">
        As fichas dos personagens são confidenciais. Somente quem tiver a chave de acesso
        fornecida pelo Narrador pode consultá-las.
      </p>
    </div>
  `;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

let annotationSync = null;
let _characters    = [];

async function fetchCharacters() {
  try {
    const session = Access.getSession();
    const res = await fetch(CONFIG.ENDPOINTS.CHARACTERS, {
      headers: session.token ? { 'Authorization': `Bearer ${session.token}` } : {},
    });
    if (res.ok) return await res.json();
  } catch {
    // backend indisponível → usa mock local
  }
  return MOCK_CHARACTERS;
}

function selectCharacter(id) {
  const char = _characters.find(c => c.id === id);
  if (!char) return;

  // Atualizar estado dos botões do seletor
  document.querySelectorAll('.char-selector-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === id);
  });

  const sheetEl = document.getElementById('char-sheet');
  if (sheetEl) sheetEl.innerHTML = renderSheet(char);

  // Reinicializar sync de anotações para o personagem selecionado
  if (annotationSync) { annotationSync.destroy(); annotationSync = null; }
  annotationSync = new AnnotationSync(char.id);

  const textarea = document.getElementById('annotations-textarea');
  const statusEl = document.getElementById('sync-status');

  annotationSync.onChange(state => {
    if (textarea && textarea.value !== state.content) textarea.value = state.content;
    if (statusEl) {
      statusEl.className   = `sync-status ${state.syncStatus}`;
      statusEl.textContent =
        state.syncStatus === 'synced'  ? '✓ Sincronizado' :
        state.syncStatus === 'pending' ? '⟳ Salvando...'  : '✗ Erro';
    }
  });

  textarea?.addEventListener('input', e => annotationSync.update(e.target.value));
}

async function initCharacters() {
  const root = document.getElementById('characters-root');
  if (!root) return;

  if (annotationSync) { annotationSync.destroy(); annotationSync = null; }

  if (!Access.hasAccess('restricted')) {
    root.innerHTML = renderLocked();
    return;
  }

  _characters = await fetchCharacters();

  root.innerHTML = `
    ${_characters.length > 1 ? renderSelector(_characters) : ''}
    <div id="char-sheet"></div>
  `;

  // Seleciona o primeiro personagem por padrão
  if (_characters.length > 0) selectCharacter(_characters[0].id);
}

window.selectCharacter = selectCharacter;
window.addEventListener('accesschanged', initCharacters);
document.addEventListener('DOMContentLoaded', initCharacters);
