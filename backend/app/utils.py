import PyPDF2
import io
import base64
import json
import re
import os
from pathlib import Path
import tempfile
from typing import Optional, Dict, Any, List, BinaryIO

# PDF Processing
def extract_text_from_pdf(pdf_file: BinaryIO) -> Optional[str]:
    """Extract text from a PDF file."""
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return None

# File Operations
def save_temp_file(file_content: bytes, extension: str = ".pdf") -> str:
    """Save bytes content to a temporary file and return the path."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
        temp_file.write(file_content)
        return temp_file.name

def read_file(file_path: str) -> bytes:
    """Read a file and return its contents as bytes."""
    with open(file_path, "rb") as f:
        return f.read()

def encode_file_to_base64(file_content: bytes) -> str:
    """Encode file content to base64 string."""
    return base64.b64encode(file_content).decode('utf-8')

# JSON Parsing
def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """Extract JSON from text response."""
    # Try to find JSON in code blocks
    json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Try to find JSON without code blocks
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        else:
            # If no JSON found, return None
            return None
    
    try:
        # Parse the JSON
        return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing JSON: {str(e)}")
        return None 