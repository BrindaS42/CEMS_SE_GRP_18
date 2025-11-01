import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

llm = ChatGroq(
    model_name="openai/gpt-oss-20b",
    temperature=0
)