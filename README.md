# Fear City — Crônica de RPG
## Vampiro: A Máscara · Nova Iorque, 1970s

```
fear-city/
│
├── frontend/                        # Cloudflare Pages (estático puro)
│   ├── index.html                   # Home
│   ├── pages/
│   │   ├── chronicle.html           # Lista de capítulos
│   │   ├── characters.html          # Fichas de personagem
│   │   └── media.html               # Vídeos do YouTube
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css            # Todo o CSS (ex-Tailwind + globals)
│   │   ├── js/
│   │   │   ├── config.js            # API_BASE_URL e constantes globais
│   │   │   ├── access.js            # Controle de chave/sessão (ex-access-context)
│   │   │   ├── header.js            # Header dinâmico + modal de chave
│   │   │   ├── annotations.js       # Sync local-first de anotações (ex-use-annotation-sync)
│   │   │   ├── chronicle.js         # Lógica da página de crônica
│   │   │   ├── characters.js        # Lógica da ficha de personagem
│   │   │   └── media.js             # Lógica da página de vídeos (lê videos.json)
│   │   └── data/
│   │       └── videos.json          # ← EDITE AQUI para gerenciar vídeos
│   └── components/
│       ├── header.html              # Fragmento do header (injetado via JS)
│       └── footer.html              # Fragmento do footer (injetado via JS)
│
└── backend/                         # Render/Railway (container Python)
    ├── main.py                      # Entrypoint FastAPI
    ├── requirements.txt
    ├── .env.example
    └── app/
        ├── core/
        │   ├── config.py            # Variáveis de ambiente (Supabase URL, keys)
        │   └── supabase.py          # Cliente Supabase singleton
        ├── routers/
        │   ├── auth.py              # POST /auth/validate-key
        │   ├── chapters.py          # GET  /chapters
        │   ├── characters.py        # GET  /characters/{id}
        │   └── annotations.py       # GET/POST /annotations/{character_id}
        └── models/
            └── schemas.py           # Pydantic models
```

## Rodar localmente

### Frontend
```bash
# Qualquer servidor HTTP estático serve
cd frontend
npx serve .         # ou: python3 -m http.server 8080
# → http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # preencher com suas credenciais Supabase
uvicorn main:app --reload --port 8000
# → http://localhost:8000/docs  (Swagger automático)
```
