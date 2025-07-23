import time
from datetime import datetime
from elasticsearch import AsyncElasticsearch
from .mappings import INDEX_MAPPING
from ..core.config import get_settings

settings = get_settings()

class IndexManager:
    def __init__(self, client: AsyncElasticsearch):
        self.client = client

    async def create_new_versioned_index(self) -> str:
        date_str = datetime.now().strftime("%Y%m%d")
        new_index_name = f"{settings.INDEX_NAME_PREFIX}{date_str}"
        
        suffix = ""
        count = 1
        while await self.client.indices.exists(index=new_index_name + suffix):
            suffix = f"_{count}"
            count += 1
        
        new_index_name = new_index_name + suffix
        print(f"Creating new index: '{new_index_name}'")
        await self.client.indices.create(
            index=new_index_name,
            settings=INDEX_MAPPING["settings"],
            mappings=INDEX_MAPPING["mappings"]
        )
        return new_index_name

    async def point_alias_to_index(self, new_index_name: str):
        print(f"Atomically swapping alias '{settings.ALIAS_NAME}' to point to '{new_index_name}'...")
        await self.client.indices.update_aliases(actions=[
            {"remove": {"index": f"{settings.INDEX_NAME_PREFIX}*", "alias": settings.ALIAS_NAME, "must_exist": False}},
            {"add": {"index": new_index_name, "alias": settings.ALIAS_NAME}}
        ])
        print("Alias swap complete.")

    async def cleanup_old_indices(self, new_index_name: str):
        print("Searching for old indices to decommission...")
        all_indices = await self.client.indices.get(index=f"{settings.INDEX_NAME_PREFIX}_v*")
        for index_name in all_indices.keys():
            if index_name != new_index_name:
                print(f"Decommissioning old index: '{index_name}'")
                await self.client.indices.delete(index=index_name)