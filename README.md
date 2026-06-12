# 🎥 YouTube Summarizer

A powerful AI-driven Streamlit application that extracts transcripts from YouTube videos, translates them to English if necessary, generates concise structured notes with key topics, and allows you to interactively chat with the video's content using Retrieval-Augmented Generation (RAG).

---

## 🚀 Key Features

* **Automated Transcript Extraction:** Fetch transcripts in any supported language using the YouTube Transcript API.
* **Auto-Translation to English:** Automatically translates transcripts in foreign languages to English using the advanced **Gemini 2.5 Flash** model.
* **Smart Topic & Notes Extraction:** Extracts the 5 most important topics and produces concise, bulleted study notes.
* **RAG-based Chatbot:** Create a semantic vector store from the transcript chunks and ask any question about the video in real-time.

---

## 🛠️ Tech Stack

* **Frontend UI:** [Streamlit](https://streamlit.io/)
* **AI Models:** 
  * LLM: Google Gemini (`gemini-2.5-flash`)
  * Embeddings: Google Generative AI Embeddings (`models/gemini-embedding-001`)
* **Orchestration & Vector Store:**
  * [LangChain](https://www.langchain.com/) (Prompts, Chains, Text Splitter)
  * [Chroma](https://github.com/chroma-core/chroma) (Vector database)
* **Data Sources:** [YouTube Transcript API](https://github.com/jakecreps/youtube-transcript-api)

---

## 📂 Project Structure

```
├── app.py                  # Main Streamlit application UI and chat session state
├── supporting_functions.py  # core processing logic (translation, notes, vector store, and QA)
├── requirements.txt         # Project dependencies
├── .env                     # Local environment secrets (API Keys)
└── .vscode/settings.json    # Workspace interpreter settings
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have Python 3.10+ installed. This project is configured to use [uv](https://github.com/astral-sh/uv) or a standard Python virtual environment.

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Google API key:

```env
GOOGLE_API_KEY="your-gemini-api-key-here"
```

### 3. Install Dependencies
You can install dependencies into the local virtual environment. 

Using **`uv`** (recommended):
```bash
uv pip install -r requirements.txt
```

Or using standard **`pip`** (after activating your venv):
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 🖥️ Running the Application

Start the Streamlit development server using your virtual environment:

Using **`uv`**:
```bash
uv run streamlit run app.py
```

Or using the virtual environment's executable path directly:
```bash
./.venv/bin/streamlit run app.py
```

Open the local URL (usually `http://localhost:8501`) in your browser to start summarizing!
