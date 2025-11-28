"""
Simple JSONL file reader for MeiliSearch indexing.
"""

import json
import os
from typing import Iterator, Dict, Any

def read_jsonl_lines() -> Iterator[Dict[str, Any]]:
    """
    Read the dataset file from the SAME directory as this script.
    """
    # Get the directory where this script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Look for the file in the same directory
    filepath = os.path.join(current_dir, "LexFridman_Dataset_Eng.jsonl")

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Could not find dataset file at: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if line:  
                yield json.loads(line)
