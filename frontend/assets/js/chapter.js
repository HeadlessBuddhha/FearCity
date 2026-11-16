/**
 * chapter.js — Página de leitura de um capítulo individual
 *
 * Lê o parâmetro ?slug=xxx da URL, busca o capítulo no backend
 * (ou no fallback local) e renderiza o conteúdo.
 */

// Conteúdo local de fallback por slug
// Substitua o campo `body` pelo texto real de cada capítulo
const CHAPTERS_CONTENT = {
  'prologo': {
    id:          'ch-001',
    title:       'Prólogo: Entrando na Cidade do Medo',
    accessLevel: 'public',
    order:       0,
    epigraph:    '"Pede-me, e eu te darei os gentios por herança, e os fins da terra por tua possessão. Tu os esmigalharás com uma vara de ferro; tu os despedaçarás como a um vaso de oleiro." — Salmos 2:8-12.',
    body: `
      <p>Nova Iorque, 1975. A cidade que nunca dorme tampouco morre — ela apenas muda de forma, de hora em hora, de quarteirão em quarteirão, de luz em sombra.</p>
      <p>Nas ruas do Bronx, o fogo consome prédios enquanto os proprietários assistem de longe, calculando o seguro. Em Harlem, a música escorre pelas janelas abertas como sangue de uma ferida que ninguém quer curar. Em Manhattan, os ternos caminham rápido demais para ver o que rasteja abaixo deles.</p>
      <p>E abaixo de tudo isso — abaixo do asfalto, abaixo dos esgotos, abaixo da memória coletiva de uma cidade que prefere esquecer — existe outra cidade. Mais antiga. Mais fria. Mais faminta.</p>
      <p><em>Bem-vindo à Fear City.</em></p>
      <p>Adicione aqui o texto completo do prólogo.</p>
    `,
  },
  'capitulo-i': {
    id:          'ch-002',
    title:       'Capítulo I — Why Can\'t You See The Funny Side?',
    accessLevel: 'public',
    order:       1,
    epigraph:    '"E Adão pôs os nomes a todo o gado, e às aves dos céus, e a todo o animal do campo; mas para o homem não se achava ajudadora idônea." — Gênesis 2:20',
    body: `<p>Adicione aqui o texto completo do Capítulo I.</p>`,
  },
  'capitulo-ii': {
    id:          'ch-003',
    title:       'Capítulo II — O Demônio Roubou a Minha Mulher',
    accessLevel: 'public',
    order:       2,
    epigraph:    'Melódico Mal Cantado Pseudo-Romântico.',
    body: `<p>Adicione aqui o texto completo do Capítulo II.</p>`,
  },
  'capitulo-iii': {
    id:          'ch-004',
    title:       'Capítulo III — Abandonai Toda a Esperança Vós que Entrais',
    accessLevel: 'restricted',
    order:       3,
    epigraph:    '"The oldest and strongest emotion is fear, and the oldest and strongest kind of fear is fear of the unknown." — H. P. Lovecraft',
    body: `<p>Adicione aqui o texto completo do Capítulo III.</p>`,
  },
  'interludio-i': {
    id:          'ch-005',
    title:       'Interlúdio: A Voz do Sangue',
    accessLevel: 'restricted',
    order:       4,
    epigraph:    'Perspectivas dos não-nascidos.',
    body: `<p>Adicione aqui o texto completo do Interlúdio.</p>`,
  },
};

const ALL_SLUGS = Object.keys(CHAPTERS_CONTENT);

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchChapter(slug) {
  try {
    const session = Access.getSession();
    const res = await fetch(`${CONFIG.ENDPOINTS.CHAPTERS}/${slug}`, {
      headers: session.token ? { 'Authorization': `Bearer ${session.token}` } : {},
    });
    if (res.ok) return await res.json();
    if (res.status === 403) return { _blocked: true };
  } catch {
    // backend indisponível
  }
  return CHAPTERS_CONTENT[slug] || null;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderChapter(chapter) {
  const idx  = ALL_SLUGS.indexOf(window._currentSlug);
  const prev = idx > 0 ? ALL_SLUGS[idx - 1] : null;
  const next = idx < ALL_SLUGS.length - 1 ? ALL_SLUGS[idx + 1] : null;

  const prevChapter = prev ? CHAPTERS_CONTENT[prev] : null;
  const nextChapter = next ? CHAPTERS_CONTENT[next] : null;

  return `
    <div class="chapter-page-header animate-fade-in">
      <a href="/pages/chronicle.html" class="chapter-back">← Voltar à Crônica</a>
      <div class="chapter-tag" style="margin-bottom:0.5rem">
        ${String(chapter.order).padStart(2,'0')} · Fear City
      </div>
      <h1 class="chapter-page-title">${chapter.title}</h1>
      ${chapter.epigraph
        ? `<blockquote class="chapter-page-epigraph">${chapter.epigraph}</blockquote>`
        : ''}
      <div class="ornament-divider" style="max-width:24rem">
        <span class="font-cinzel" style="color:var(--blood-700)">❧</span>
      </div>
    </div>

    <div class="chapter-page-body animate-fade-in">
      ${chapter.body || '<p>Conteúdo em breve.</p>'}
    </div>

    <nav class="chapter-nav">
      ${prevChapter
        ? `<a href="/pages/chapter.html?slug=${prev}">← ${prevChapter.title}</a>`
        : `<span></span>`
      }
      ${nextChapter
        ? `<a href="/pages/chapter.html?slug=${next}">${nextChapter.title} →</a>`
        : `<span></span>`
      }
    </nav>
  `;
}

function renderBlocked() {
  return `
    <a href="/pages/chronicle.html" class="chapter-back">← Voltar à Crônica</a>
    ${LockedContent('Capítulo Selado')}
    <p class="lore-text" style="text-align:center;margin-top:1.5rem">
      Este capítulo exige a chave de acesso do Narrador.
    </p>
  `;
}

function renderNotFound() {
  return `
    <a href="/pages/chronicle.html" class="chapter-back">← Voltar à Crônica</a>
    <p class="lore-text" style="text-align:center;margin-top:3rem">
      Capítulo não encontrado.
    </p>
  `;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function initChapter() {
  const root = document.getElementById('chapter-root');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');
  window._currentSlug = slug;

  if (!slug) {
    root.innerHTML = renderNotFound();
    return;
  }

  const chapter = await fetchChapter(slug);

  if (!chapter) {
    root.innerHTML = renderNotFound();
    return;
  }

  if (chapter._blocked || (chapter.accessLevel === 'restricted' && !Access.hasAccess('restricted'))) {
    root.innerHTML = renderBlocked();
    return;
  }

  // Atualiza o título da aba
  document.title = `${chapter.title} — Fear City`;

  root.innerHTML = renderChapter(chapter);
}

window.addEventListener('accesschanged', initChapter);
document.addEventListener('DOMContentLoaded', initChapter);
