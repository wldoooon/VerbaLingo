INDEX_MAPPING = {
    "settings": {
        "analysis": {
            "analyzer": {
                "english_smart": {
                    "tokenizer": "standard",
                    "filter": [
                        "english_possessive_stemmer",
                        "lowercase",
                        "english_stop",
                        "english_stemmer"
                    ]
                }
            },
            "filter": {
                "english_stop": {
                    "type": "stop",
                    "stopwords": "_english_"
                },
                "english_stemmer": {
                    "type": "stemmer",
                    "language": "english"
                },
                "english_possessive_stemmer": {
                    "type": "stemmer",
                    "language": "possessive_english"
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "sentence_text": {
                "type": "text",
                "analyzer": "english_smart"
            },
            "start": {"type": "half_float"},
            "end": {"type": "half_float"},
            "video_id": {"type": "keyword"},
            "video_title": {"type": "keyword"},
            "channel_title": {"type": "keyword"},
            "category": {"type": "keyword"},
            "position": {"type": "integer"}
        }
    }
}