"""
Simple JSONL file reader for Manticore Search indexing.
"""

import json
import os
from typing import Iterator, Dict, Any

def read_jsonl_lines(filepath: str) -> Iterator[Dict[str, Any]]:
    """
    Read a JSONL file and yield each line as a dictionary.
    
    Args:
        filepath: Path to the JSONL file to read
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Could not find dataset file at: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if line:  
                yield json.loads(line)
