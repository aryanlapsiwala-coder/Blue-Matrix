# KnowBot RAG Semantic Search Backend

The KnowBot backend provides a Retrieval-Augmented Generation (RAG) pipeline for the **KnowPass** Campus Knowledge System.

---

## 🛠️ Setup & Running

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` and optionally provide your Gemini / Groq API key:
```bash
cp .env.example .env
```

### 3. Start Backend Server
```bash
npm start
```
The server will boot on `http://localhost:5000`.

---

## 📡 API Endpoints

### 1. `POST /api/v1/chat/query`
Executes vector semantic search over campus documents, constructs grounded prompt context, calls LLM, and returns the synthesized answer with **top-3 source citation cards**.

#### Request:
```json
{
  "query": "How do I connect to the HPC cluster and submit SLURM batch jobs?"
}
```

#### Response:
```json
{
  "success": true,
  "reply": "To access the campus HPC cluster, SSH using `ssh your_id@hpc.campus.edu`...",
  "citations": [
    {
      "id": "kb_01",
      "title": "High Performance Computing Cluster (HPC) Setup & SLURM Access Guidelines",
      "author": "Marcus Ramirez",
      "authorRole": "TECHNICIAN",
      "department": "Central Computing & Hardware Labs",
      "matchPercentage": 96
    }
  ]
}
```
