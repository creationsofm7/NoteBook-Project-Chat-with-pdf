# 🚀 NoteBookOne — Chat With Your PDFs!

Welcome to **NoteBookOne** — the AI-powered PDF chat app that lets you upload, select, and chat with your documents. Built with ❤️ using React, FastAPI, LangChain, and OpenAI.

---

## ✨ Features

- **Upload Multiple PDFs** and manage your document library
- **Chat with One or Many PDFs** at once — get instant answers!
- **AI-Powered Q&A** using OpenAI GPT-4.1 and vector search
- **Modern UI** with React, TailwindCSS, and React Router
- **Fast, Secure, and Scalable** — ready for local or cloud deployment

---

## 🛠️ Getting Started

### 1. Clone the Repo

```sh
git clone https://github.com/creationsofm7/notebookone.git
cd notebookone
```

---

## ▶️ Start the Monorepo (Frontend & Backend Together)

From the project root, you can start both the frontend and backend at once:

```sh
npm install
npm run dev
```

- This will launch both the frontend and backend in parallel.
- Make sure you have set up your environment variables as described above.

---

## OR

### 2. Install Dependencies

#### Frontend

```sh
cd Frontend
npm install
```

#### Backend

```sh
cd ../Backend
pip install -r requirements.txt
```

### 3. Environment Setup

- Copy `.env.example` to `.env` in `Backend/` and add your OpenAI API key.

### 4. Run in Development

#### Start Backend

```sh
cd Backend
uvicorn fastapi_app:app --reload
```

#### Start Frontend

```sh
cd Frontend
npm run dev
```

- Visit [http://localhost:5173](http://localhost:5173) to use the app!



## 🐳 Docker (Optional)

Build and run both services with Docker:

```sh
# Backend
cd Backend
docker build -t notebookone-backend .
docker run -p 8000:8000 --env-file .env notebookone-backend

# Frontend
cd ../Frontend
docker build -t notebookone-frontend .
docker run -p 3000:3000 notebookone-frontend
```

---

## 📚 Project Structure

```
notebookone/
├── Frontend/   # React + Vite + Tailwind
└── Backend/    # FastAPI + LangChain + SQLite
```

---

## 🤖 Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS, React Router, Uppy
- **Backend:** FastAPI, LangChain, OpenAI, FAISS, SQLite
- **PDF Parsing:** PyMuPDF4LLM
- **Vector Embeddings:** OpenAI Embeddings + FAISS

---

## 📝 Usage

1. **Upload PDFs** via the sidebar.
2. **Select** one or more documents.
3. **Ask questions** — get instant, context-aware answers.
4. **Chat history** is preserved per document selection.

---

## 💡 Tips

- You can drag & drop PDFs or use the upload button.
- Toggle "Select all" to chat with your entire library.
- All data stays local unless you deploy to the cloud.

---

## 🦄 Contributing

Pull requests and issues are welcome! Help us make NoteBookOne even more slay.

---


