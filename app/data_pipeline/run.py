import asyncio
import logging
from elasticsearch import AsyncElasticsearch
from app.core.config import get_settings
from .index_manager import IndexManager
from .bulk_ingestor import BulkIngestor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

async def main():
    logger.info("--- DATA PIPELINE ORCHESTRATOR ---")
    client = None
    try:
        client = AsyncElasticsearch(hosts=[settings.ELASTICSEARCH_URL])
        if not await client.ping():
            raise ConnectionError("Could not connect to Elasticsearch.")
        logger.info("Connected to Elasticsearch.")

        manager = IndexManager(client)
        ingestor = BulkIngestor(client)

        new_index = await manager.create_new_versioned_index()
        logger.info(f"New index created: {new_index}")

        await ingestor.ingest_from_file(settings.DATA_FILE_PATH, new_index)
        logger.info(f"Data ingested into index: {new_index}")

        await manager.point_alias_to_index(new_index)
        logger.info(f"Alias updated to point to: {new_index}")

        if settings.CLEANUP_OLD_INDICES:
            await manager.cleanup_old_indices(new_index)
            logger.info("Old indices cleaned up.")

        logger.info("--- PIPELINE EXECUTION SUCCESSFUL ---")

    except Exception as e:
        logger.error(f"--- PIPELINE FAILED --- \nAn error occurred: {e}")
    finally:
        if client:
            await client.close()
            logger.info("Elasticsearch connection closed.")

if __name__ == "__main__":
    asyncio.run(main())