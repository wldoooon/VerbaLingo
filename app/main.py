from fastapi import FastAPI, Request, Depends
from .core.config import get_settings
from contextlib import asynccontextmanager
from elasticsearch import AsyncElasticsearch
from app.api.routes import router


settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.es_client = None
    connection_args = {"hosts" : [settings.ELASTICSEARCH_URL]}
    try: 
        client = AsyncElasticsearch(**connection_args)
        if not await client.ping():
            raise ConnectionError("Elasticsearch connection failed.")
        app.state.es_client = client
        print("Connected to Elasticsearch successfully.")
    except Exception as e:
        app.state.es_client = None
        raise ConnectionError(f"An error occurred while connecting to Elasticsearch: {str(e)}")

    yield

    print("Shutting down the application...")
    if app.state.es_client:
        try:
            await app.state.es_client.close()
            print("Elasticsearch connection closed.")
        except Exception as e:
            print(f"Error closing Elasticsearch connection: {str(e)}")


app = FastAPI(lifespan=lifespan)

app.include_router(router)





