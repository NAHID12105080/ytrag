import streamlit as st
from streamlit import spinner

from core import config
from core.exceptions import YtragError
from core.notes import generate_notes, get_important_topics
from core.rag import create_chunks, create_vector_store, rag_answer
from core.translation import translate_transcript
from core.youtube import extract_video_id, get_transcript

TASK_NOTES = "Notes For You"
TASK_CHAT = "Chat with Video"

try:
    config.get_api_key()
except YtragError as e:
    st.error(str(e))
    st.stop()


# --- Sidebar (Inputs) ---
with st.sidebar:
    st.title("Youtube summarizer")
    st.markdown("---")
    st.markdown("Transform any YouTube video into key topics, a podcast, or a chatbot.")
    st.markdown("### Input Details")

    youtube_url = st.text_input("YouTube URL", placeholder="https://www.youtube.com/watch?v=...")
    language = st.text_input("Video Language Code", placeholder="e.g., en, hi, es, fr", value=config.DEFAULT_LANGUAGE)

    task_option = st.radio(
        "Choose what you want to generate:",
        [TASK_CHAT, TASK_NOTES]
    )

    submit_button = st.button("✨ Start Processing")
    st.markdown("---")

# --- Main Page ---
st.title("YouTube Summarizer")
st.markdown("Paste a video link and select a task from the sidebar.")


# --- Processing Flow ---
if submit_button:
    if youtube_url and language:
        try:
            video_id = extract_video_id(youtube_url)

            with spinner("Step 1/3 : Fetching Transcript....."):
                full_transcript = get_transcript(video_id, language)

                if language != "en":
                    with spinner("Step 1.5/3 : Translating Transcript into English, This may take few moments......"):
                        full_transcript = translate_transcript(full_transcript)

            if task_option == TASK_NOTES:
                with spinner("Step 2/3: Extracting important Topics..."):
                    important_topics = get_important_topics(full_transcript)
                    st.subheader("Important Topics")
                    st.write(important_topics)
                    st.markdown("---")

                with spinner("Step 3/3 : Generating Notes for you."):
                    notes = generate_notes(full_transcript)
                    st.subheader("Notes for you")
                    st.write(notes)

                st.success("Summary and Notes Generated.")

            if task_option == TASK_CHAT:
                with st.spinner("Step 2/3: Creating chunks and vector store...."):
                    chunks = create_chunks(full_transcript)
                    vectorstore = create_vector_store(chunks)
                    st.session_state.vector_store = vectorstore
                st.session_state.messages = []
                st.success('Video is ready for chat.....')

        except YtragError as e:
            st.error(str(e))
            st.stop()
    else:
        st.warning("Please provide both a YouTube URL and a language code.")


# chatbot session
if task_option == TASK_CHAT and "vector_store" in st.session_state:
    st.divider()
    st.subheader("Chat with Video")

    # Display the entire history
    for message in st.session_state.get('messages', []):
        with st.chat_message(message['role']):
            st.write(message['content'])

    # user_input
    prompt = st.chat_input("Ask me anything about the video.")
    if prompt:
        st.session_state.messages.append({'role': 'user', 'content': prompt})
        with st.chat_message('user'):
            st.write(prompt)

        with st.chat_message('assistant'):
            try:
                response = rag_answer(prompt, st.session_state.vector_store)
            except YtragError as e:
                response = f"Sorry, something went wrong: {e}"
            st.write(response)
        st.session_state.messages.append({'role': 'assistant', 'content': response})
