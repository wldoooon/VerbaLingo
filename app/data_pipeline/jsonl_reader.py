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
    # Go up two levels to root, then into dataset folder
    filepath = current_dir.parent.parent / "dataset" / "SpiderMan_Dataset_Eng.jsonl"

    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if line:  
                yield json.loads(line)
