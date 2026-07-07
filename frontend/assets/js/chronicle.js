/**
 * chronicle.js — Página de capítulos da crônica
 * Busca capítulos do FastAPI e renderiza com controle de acesso
 */

// Dados locais de fallback (enquanto o backend não está integrado)
// Em produção: remova isso e use apenas fetchChapters()
const CHAPTERS_FALLBACK = [
  {
    id: 'ch-001',
    title: 'Prólogo: Entrando na Cidade do Medo',
    slug: 'prologo',
    excerpt: '"Pede-me, e eu te darei os gentios por herança, e os fins da terra por tua possessão. Tu os esmigalharás com uma vara de ferro; tu os despedaçarás como a um vaso de oleiro." — Salmos 2:8-12.',
    accessLevel: 'public',
    order: 0,
  },
  {
    id: 'ch-002',
    title: 'Capítulo I — Why Can\'t You See The Funny Side? Why Aren\'t You Laughing?',
    slug: 'capitulo-i',
    excerpt: '"E Adão pôs os nomes a todo o gado, e às aves dos céus, e a todo o animal do campo; mas para o homem não se achava ajudadora idônea." — Gênesis 2:20',
    accessLevel: 'public',
    order: 1,
  },
  {
    id: 'ch-003',
    title: 'Capítulo II — O Demônio Roubou a Minha Mulher (e agora eu estou livre!)',
    slug: 'capitulo-ii',
    excerpt: 'Melódico Mal Cantado Pseudo-Romântico.',
    accessLevel: 'public',
    order: 2,
  },
  {
    id: 'ch-004',
    title: 'Capítulo III — Abandonai Toda a Esperança Vós que Entrais',
    slug: 'capitulo-iii',
    excerpt: '"The oldest and strongest emotion is fear, and the oldest and strongest kind of fear is fear of the unknown." — H. P. Lovecraft',
    accessLevel: 'restricted',
    order: 3,
  },
  {
    id: 'ch-005',
    title: 'Interlúdio: A Voz do Sangue',
    slug: 'interludio-i',
    excerpt: 'Perspectivas dos não-nascidos.',
    accessLevel: 'restricted',
    order: 4,
  },
];

// ─── Fetch do backend ───────────────────────────────────────────────────────
async function fetchChapters() {
  try {
    const session = Access.getSession();
    const res = await fetch(CONFIG.ENDPOINTS.CHAPTERS, {
      headers: session.token
        ? { 'Authorization': `Bearer ${session.token}` }
        : {},
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Chronicle] Backend indisponível, usando dados locais.', err);
  }
  return CHAPTERS_FALLBACK; // fallback local
}

// ─── Render ─────────────────────────────────────────────────────────────────
function renderChapter(chapter, index) {
  const canRead = Access.hasAccess(chapter.accessLevel);
  const num = String(chapter.order).padStart(2, '0');
  const delay = index * 80;

  if (canRead) {
    return `
      <a
        href="/pages/chapter.html?slug=${chapter.slug}"
        class="chronicle-card chapter-card animate-slide-up"
        style="animation-delay:${delay}ms; text-decoration:none"
      >
        <div class="chapter-card-inner">
          <div style="flex:1">
            <div class="chapter-meta">
              <span class="chapter-num">${num}</span>
              <span class="access-badge public">Público</span>
            </div>
            <h2 class="chapter-title font-cinzel">${chapter.title}</h2>
            <p class="chapter-excerpt">${chapter.excerpt}</p>
          </div>
          <span class="chapter-arrow">→</span>
        </div>
      </a>
    `;
  } else {
    return `
      <div class="chronicle-card chapter-locked animate-slide-up" style="animation-delay:${delay}ms">
        <div class="chapter-locked-header">
          <div class="chapter-meta">
            <span class="chapter-num">${num}</span>
            <span class="access-badge restricted">🔒 Restrito</span>
          </div>
          <h2 class="chapter-title font-cinzel">${chapter.title}</h2>
        </div>
        ${LockedContent('Capítulo Selado')}
      </div>
    `;
  }
}

async function initChronicle() {
  const list = document.getElementById('chapters-list');
  if (!list) return;

  const chapters = await fetchChapters();
  list.innerHTML = chapters.map((ch, i) => renderChapter(ch, i)).join('');
}

// Re-renderizar quando sessão mudar (usuário desbloqueou)
window.addEventListener('accesschanged', initChronicle);

document.addEventListener('DOMContentLoaded', initChronicle);
