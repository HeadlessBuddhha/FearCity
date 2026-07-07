/**
 * characters.js — Fichas de personagem com anotações sincronizadas
 * Equivalente ao characters/page.tsx (sem React)
 */

// Mock local — em produção: GET /characters do FastAPI
const MOCK_CHARACTER = {
  id: 'char-001',
  name: 'Valentina Greco',
  concept: 'Advogada que descobriu o mundo oculto',
  clan: 'Toreador',
  generation: 11,
  nature: 'Arquiteta',
  demeanor: 'Bon Vivant',
  haven: 'Apartamento no centro histórico',
  attributes: {
    physical: [
      { name: 'Força',    value: 2, max: 5 },
      { name: 'Destreza', value: 3, max: 5 },
      { name: 'Vigor',    value: 2, max: 5 },
    ],
    social: [
      { name: 'Carisma',      value: 4, max: 5 },
      { name: 'Manipulação',  value: 3, max: 5 },
      { name: 'Aparência',    value: 4, max: 5 },
    ],
    mental: [
      { name: 'Percepção',   value: 3, max: 5 },
      { name: 'Inteligência',value: 3, max: 5 },
      { name: 'Raciocínio',  value: 2, max: 5 },
    ],
  },
  disciplines: [
    { name: 'Presença',  level: 2 },
    { name: 'Auspícios', level: 1 },
  ],
  bloodPool:  { current: 8,  max: 12 },
  willpower:  { current: 6,  max: 7  },
  humanity:   7,
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function dots(value, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span class="dot ${i < value ? 'filled' : 'empty'}"></span>`
  ).join('');
}

function poolBar(current, max, type) {
  const pct = Math.round((current / max) * 100);
  return `<div class="pool-bar-bg"><div class="pool-bar-fill ${type}" style="width:${pct}%"></div></div>`;
}

function attrSection(label, attrs) {
  const rows = attrs.map(a => `
    <div class="attr-row">
      <span class="attr-name">${a.name}</span>
      <div class="attr-dots">${dots(a.value, a.max)}</div>
    </div>
  `).join('');
  return `
    <div class="chronicle-card p-4">
      <h3 class="attr-section-title font-cinzel">${label}</h3>
      ${rows}
    </div>
  `;
}

// ─── Render da ficha ─────────────────────────────────────────────────────────
function renderSheet(char) {
  return `
    <div class="space-y-8 animate-fade-in">

      <!-- Header da ficha -->
      <div class="chronicle-card corner-ornament p-6">
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
        </div>
      </div>

      <!-- Atributos -->
      <div class="sheet-grid-2" style="grid-template-columns:repeat(3,1fr)">
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
              <span class="pool-bar-value-blood">${char.bloodPool.current}/${char.bloodPool.max}</span>
            </div>
            ${poolBar(char.bloodPool.current, char.bloodPool.max, 'blood')}
          </div>

          <div class="pool-bar-wrap">
            <div class="pool-bar-header">
              <span class="pool-bar-label">Força de Vontade</span>
              <span class="pool-bar-value-will">${char.willpower.current}/${char.willpower.max}</span>
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
          <h3 class="attr-section-title font-cinzel" style="margin-bottom:0">Anotações Pessoais</h3>
          <span class="sync-status synced" id="sync-status">✓ Sincronizado</span>
        </div>
        <textarea
          id="annotations-textarea"
          class="input-dark"
          style="min-height:140px;resize:vertical;margin-top:0.75rem"
          placeholder="Suas notas sobre a sessão, pistas encontradas, NPCs conhecidos..."
        ></textarea>
        <p class="annotations-hint">Salvo localmente · Sincroniza com a nuvem automaticamente</p>
      </div>

    </div>
  `;
}

// ─── Render bloqueado ────────────────────────────────────────────────────────
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

// ─── Init ────────────────────────────────────────────────────────────────────
let annotationSync = null;

async function initCharacters() {
  const root = document.getElementById('characters-root');
  if (!root) return;

  if (annotationSync) { annotationSync.destroy(); annotationSync = null; }

  if (!Access.hasAccess('restricted')) {
    root.innerHTML = renderLocked();
    return;
  }

  // TODO: fetch real → GET /characters/char-001
  const char = MOCK_CHARACTER;
  root.innerHTML = renderSheet(char);

  // Inicializar sync de anotações
  annotationSync = new AnnotationSync(char.id);

  const textarea  = document.getElementById('annotations-textarea');
  const statusEl  = document.getElementById('sync-status');

  annotationSync.onChange((state) => {
    if (textarea && textarea.value !== state.content) {
      textarea.value = state.content;
    }
    if (statusEl) {
      statusEl.className = `sync-status ${state.syncStatus}`;
      statusEl.textContent =
        state.syncStatus === 'synced'  ? '✓ Sincronizado'  :
        state.syncStatus === 'pending' ? '⟳ Salvando...'   :
        '✗ Erro';
    }
  });

  textarea?.addEventListener('input', (e) => {
    annotationSync.update(e.target.value);
  });
}

window.addEventListener('accesschanged', initCharacters);
document.addEventListener('DOMContentLoaded', initCharacters);
