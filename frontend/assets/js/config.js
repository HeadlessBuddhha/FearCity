/**
 * config.js — Configuração central
 *
 * Backend local: http://localhost:8000
 * Para produção, troque API_BASE_URL pela URL do Render/Railway.
 */

const API_BASE_URL = 'http://localhost:8000';

const CONFIG = Object.freeze({
  API_BASE_URL,

  ENDPOINTS: {
    VALIDATE_KEY: `${API_BASE_URL}/auth/validate-key`,
    CHAPTERS:     `${API_BASE_URL}/chapters`,
    CHARACTERS:   `${API_BASE_URL}/characters`,
    ANNOTATIONS:  `${API_BASE_URL}/annotations`,
  },

  STORAGE: {
    SESSION:    'fc_session',
    ANNOTATION: (charId) => `fc_annotation_${charId}`,
  },

  VIDEOS_JSON: '/assets/data/videos.json',
});
