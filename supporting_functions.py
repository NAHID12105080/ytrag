import os
import re
import streamlit as st

from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
)
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate

# --------------------------------------------------
# ENVIRONMENT SETUP
# --------------------------------------------------

load_dotenv()

if not os.getenv("GOOGLE_API_KEY"):
    st.error("GOOGLE_API_KEY not found in environment variables.")
    st.stop()

# --------------------------------------------------
# GEMINI MODEL
# --------------------------------------------------

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
)

# --------------------------------------------------
# HELPER FUNCTION
# --------------------------------------------------

def extract_video_id(url: str):
    """
    Extract YouTube video ID from a URL.
    """
    pattern = (
        r"(?:youtube\.com\/watch\?v=|youtu\.be\/)"
        r"([0-9A-Za-z_-]{11})"
    )

    match = re.search(pattern, url)

    if match:
        return match.group(1)

    st.error("Invalid YouTube URL.")
    return None


# --------------------------------------------------
# TRANSCRIPT FETCHING
# --------------------------------------------------

def get_transcript(video_id: str, language="en"):
    """
    Fetch transcript from YouTube video.
    """

    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(
            video_id,
            languages=[language]
        )

        full_transcript = " ".join(
            item.text for item in transcript
        )

        return full_transcript

    except Exception as e:
        st.exception(e)
        return None


# --------------------------------------------------
# TRANSLATION
# --------------------------------------------------

def translate_transcript(transcript):
    try:
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert translator.

            Translate the following transcript into English.

            Requirements:
            - Preserve exact meaning.
            - Preserve tone and context.
            - Do not summarize.
            - Do not add information.

            Transcript:
            {transcript}
            """
        )

        chain = prompt | llm

        response = chain.invoke(
            {"transcript": transcript}
        )

        return response.content

    except Exception as e:
        st.exception(e)
        return None


# --------------------------------------------------
# IMPORTANT TOPICS
# --------------------------------------------------

def get_important_topics(transcript):
    try:
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert content analyst.

            Extract exactly 5 major topics discussed
            in the transcript.

            Rules:
            - Return only topics discussed.
            - Output as numbered list.
            - Keep concise.
            - Focus on major concepts.

            Transcript:
            {transcript}
            """
        )

        chain = prompt | llm

        response = chain.invoke(
            {"transcript": transcript}
        )

        return response.content

    except Exception as e:
        st.exception(e)
        return None


# --------------------------------------------------
# NOTES GENERATION
# --------------------------------------------------

def generate_notes(transcript):
    try:
        prompt = ChatPromptTemplate.from_template(
            """
            You are an AI note-taking assistant.

            Generate concise notes from the transcript.

            Requirements:
            - Use bullet points.
            - Organize into sections.
            - Highlight key ideas.
            - Use short sentences.
            - Do not add information not present.

            Transcript:
            {transcript}
            """
        )

        chain = prompt | llm

        response = chain.invoke(
            {"transcript": transcript}
        )

        return response.content

    except Exception as e:
        st.exception(e)
        return None


# --------------------------------------------------
# CHUNKING
# --------------------------------------------------

def create_chunks(transcript):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )

    docs = splitter.create_documents(
        [transcript]
    )

    return docs


# --------------------------------------------------
# VECTOR STORE
# --------------------------------------------------

def create_vector_store(docs):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001"
    )

    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
    )

    return vector_store


# --------------------------------------------------
# RAG QA
# --------------------------------------------------

def rag_answer(question, vector_store):
    try:
        results = vector_store.similarity_search(
            question,
            k=4,
        )

        if not results:
            return (
                "I couldn't find that information "
                "in the transcript."
            )

        context = "\n\n".join(
            doc.page_content
            for doc in results
        )

        prompt = ChatPromptTemplate.from_template(
            """
            You are a helpful assistant.

            Rules:
            - Answer ONLY from the provided context.
            - Do not use outside knowledge.
            - If answer is not explicitly in the context,
              say:
              "I couldn't find that information in the transcript."
            - Be concise and accurate.

            Context:
            {context}

            Question:
            {question}

            Answer:
            """
        )

        chain = prompt | llm

        response = chain.invoke(
            {
                "context": context,
                "question": question,
            }
        )

        return response.content

    except Exception as e:
        st.exception(e)
        return None

