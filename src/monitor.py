import asyncio
from httpx import AsyncClient, ConnectTimeout
import time


urls = [
    "https://www.google.com",
]


async def check_url(url: str):
    async with AsyncClient() as cheker:
        start = time.perf_counter()
        r = await cheker.get(url)
        end = time.perf_counter()
        return {'site': url,
                'status': r.status_code,
                'response_time': end - start
                }
        
    
async def main():
     task = asyncio.create_task(check_url("https://yandex.ru"))
     response = await task
     print(response)


asyncio.run(main())
     


