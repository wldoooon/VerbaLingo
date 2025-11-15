"""
Simple JSONL file reader for MeiliSearch indexing.
"""

import json
from pathlib import Path
from typing import Iterator, Dict, Any


def read_jsonl_lines() -> Iterator[Dict[str, Any]]:
    """
    Read dataset.jsonl from the same directory and yield each line as a dictionary.

    Yields:
        Dictionary for each JSON line
    """
    current_dir = Path(__file__).parent
    filepath = current_dir / "SpongBob_Dataset_Eng.jsonl" # here put the name of dataset file (eg. dataset.jsonl)

    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if line:  
                yield json.loads(line)
