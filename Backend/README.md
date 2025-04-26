# 🦾 NoteBookOne Backend — FastAPI + LangChain

This is the backend for **NoteBookOne**, powering PDF uploads, vector search, and AI chat.

---

## 🚀 Features

- FastAPI REST API for PDF upload, document listing, and chat
- PDF parsing with PyMuPDF4LLM
- Embeddings and semantic search with OpenAI + FAISS
- SQLite for metadata storage
- CORS enabled for local frontend development

---

## 🛠️ Setup

```sh
pip install -r requirements.txt
cp .env.example .env  # Add your OpenAI API key
uvicorn fastapi_app:app --reload
```

- API runs at [http://localhost:8000](http://localhost:8000)
- Health check: `/health`

---

## 🐳 Docker

```sh
docker build -t notebookone-backend .
docker run -p 8000:8000 --env-file .env notebookone-backend
```

---

## 📖 API Endpoints

- `POST /upload/` — Upload one or more PDFs
- `GET /documents/` — List uploaded documents
- `POST /query/` — Ask questions about selected PDFs

---

## 🤝 Contributing

PRs welcome! See [../README.md](../README.md) for full project info.

---

MIT License.