/**
 * media.js — Página de vídeos
 * Lê /assets/data/videos.json (arquivo estático, sem backend)
 * e renderiza os cards com controle de acesso.
 */

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch { return dateStr; }
}

function renderVideoCard(video) {
  const canWatch = Access.hasAccess(video.accessLevel);
  const thumb    = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
  const ytUrl    = `https://youtube.com/watch?v=${video.youtubeId}`;

  const thumbHtml = canWatch
    ? `
      <img
        src="${thumb}"
        alt="${video.title}"
        loading="lazy"
        onerror="this.style.display='none'"
      />
      <a href="${ytUrl}" target="_blank" rel="noopener noreferrer"
         class="video-play-btn" aria-label="Assistir: ${video.title}">
        <div class="video-play-circle">▶</div>
      </a>
    `
    : `<div class="video-locked-thumb">🔒</div>`;

  const infoHtml = canWatch
    ? `
      ${video.session ? `<span class="chapter-tag video-session">Sessão ${video.session}</span>` : ''}
      <h3 class="video-title font-cinzel">${video.title}</h3>
      ${video.description ? `<p class="video-desc">${video.description}</p>` : ''}
      ${video.date ? `<p class="video-date">${formatDate(video.date)}</p>` : ''}
    `
    : `
      ${video.session ? `<span class="chapter-tag video-session">Sessão ${video.session}</span>` : ''}
      <h3 class="video-title font-cinzel">${video.title}</h3>
      <p class="video-locked-label">🔒 Acesso restrito</p>
    `;

  return `
    <div class="chronicle-card video-card">
      <div class="video-thumb">${thumbHtml}</div>
      <div class="video-info">${infoHtml}</div>
    </div>
  `;
}

async function initMedia() {
  const grid    = document.getElementById('videos-grid');
  const metaEl  = document.getElementById('videos-meta');
  if (!grid) return;

  try {
    const res  = await fetch(CONFIG.VIDEOS_JSON);
    const data = await res.json();

    if (metaEl) {
      metaEl.textContent = `${data.videos.length} sessões registradas · Atualizado em ${formatDate(data.lastUpdated)}`;
    }

    grid.innerHTML = data.videos.map(renderVideoCard).join('');

  } catch (err) {
    console.error('[Media] Erro ao carregar vídeos:', err);
    grid.innerHTML = `<p class="loading-text" style="color:var(--blood-500)">Erro ao carregar os vídeos.</p>`;
  }
}

window.addEventListener('accesschanged', initMedia);
document.addEventListener('DOMContentLoaded', initMedia);
