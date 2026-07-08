from langchain_core.prompts import ChatPromptTemplate

TRANSLATION_PROMPT = ChatPromptTemplate.from_template(
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

TOPICS_PROMPT = ChatPromptTemplate.from_template(
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

NOTES_PROMPT = ChatPromptTemplate.from_template(
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

RAG_PROMPT = ChatPromptTemplate.from_template(
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
