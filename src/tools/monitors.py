import asyncio
from httpx import AsyncClient
import time
from models import Monitor


class Cheker:
    def __init__(self):
        pass

    async def check_url(self,url: str):
        async with AsyncClient() as cheker:
            start = time.perf_counter()
            try:
                r = await cheker.get(url)
                status_code = r.status_code
            except Exception as e:
                status_code = 503
            finally:
                end = time.perf_counter()
            return {'site': url,
                    'status': status_code,
                    'response_time': end - start
                    }
            
    def create_local_task(self, url) -> asyncio.Task:
        task = asyncio.create_task(self.check_url(url))
        return task

    def task_gererator(self, monitors: list[Monitor]):
        return [self.check_url(m.url) for m in monitors]
        
        



        
checker = Cheker()