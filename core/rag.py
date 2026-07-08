from collections.abc import Iterator

from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

from core import config
from core.clients import get_embeddings, get_llm
from core.exceptions import RAGError
from core.prompts import RAG_PROMPT


def _build_context(question: str, vector_store: Chroma) -> str | None:
    results = vector_store.similarity_search(question, k=config.RETRIEVAL_K)
    if not results:
        return None
    return "\n\n".join(doc.page_content for doc in results)


def create_chunks(transcript: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
    )
    return splitter.create_documents([transcript])


def create_vector_store(docs) -> Chroma:
    return Chroma.from_documents(
        documents=docs,
        embedding=get_embeddings(),
    )


def rag_answer(question: str, vector_store: Chroma) -> str:
    try:
        context = _build_context(question, vector_store)
        if context is None:
            return "I couldn't find that information in the transcript."

        chain = RAG_PROMPT | get_llm()
        response = chain.invoke({"context": context, "question": question})

        return response.content

    except Exception as e:
        raise RAGError(str(e)) from e


def stream_rag_answer(question: str, vector_store: Chroma) -> Iterator[str]:
    try:
        context = _build_context(question, vector_store)
        if context is None:
            yield "I couldn't find that information in the transcript."
            return

        chain = RAG_PROMPT | get_llm()
        for chunk in chain.stream({"context": context, "question": question}):
            if chunk.content:
                yield chunk.content

    except Exception as e:
        raise RAGError(str(e)) from e
