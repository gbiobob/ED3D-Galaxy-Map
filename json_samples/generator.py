import os
import sys
import time
import json
import aiohttp
import asyncio
import aiofiles

# Lock for file writing
file_lock = asyncio.Lock()

async def clear_json(filename='json_samples/factions.json'):
    async with aiofiles.open(filename, 'w') as file:
        Government = {
            "1": {
                "name": "Communist Systems",
                "color": "CC0000"
            },
            "2": {
                "name": "Federal Systems",
                "color": "0000EF"
            }
        }
        file_data = {"categories": {"Government": Government}, "systems": []}
        await file.write(json.dumps(file_data, indent=4))

async def write_json(new_data, filename='json_samples/factions.json'):
    async with file_lock:
        async with aiofiles.open(filename, 'r+') as file:
            file_data = json.loads(await file.read())
            file_data["systems"].append(new_data)
            await file.seek(0)
            await file.write(json.dumps(file_data, indent=4))

async def getEDBGSData(session, url, pageNumber):
    async with session.get(url + str(pageNumber)) as response:
        if response.status == 200:
            data = await response.json()
            rawSystemData = data['docs']
            for rawSystemDataArray in rawSystemData:
                systemName = rawSystemDataArray['name']
                coords = {
                    "x": rawSystemDataArray['x'],
                    "y": rawSystemDataArray['y'],
                    "z": rawSystemDataArray['z']
                }
                government = rawSystemDataArray['government']
                allegiance = rawSystemDataArray['allegiance']
                if government == "$government_communism;":
                    cat = [1]
                elif allegiance == "federation":
                    cat = [2]
                else:
                    continue

                systemDict = {"name": systemName, "coords": coords, "cat": cat}
                await write_json(systemDict)
            if data['hasNextPage']:
                nextPage = data['nextPage']
                pageNumber += 1
                await getEDBGSData(session, url, pageNumber)
            return True
        else:
            return False

async def process_allegiance(url, allegiance):
    print(f"{allegiance} SYSTEMS STARTED AT {time.strftime('%X')}")
    start_time = time.time()
    
    async with aiohttp.ClientSession() as session:
        page_number = 1
        await getEDBGSData(session, url, page_number)

    elapsed_time = time.time() - start_time
    minutes, seconds = divmod(elapsed_time, 60)
    print(f"{allegiance} SYSTEMS COMPLETED AT {time.strftime('%X')} (Duration: {int(minutes):02d} minutes {seconds:.2f} seconds)", flush=True)

async def main():
    await clear_json()
    sys.setrecursionlimit(3000)

    allegiance_urls = [
        ("https://elitebgs.app/api/ebgs/v5/systems?allegiance=empire&page=", "IMPERIAL"),
        ("https://elitebgs.app/api/ebgs/v5/systems?allegiance=federation&page=", "FEDERAL"),
        ("https://elitebgs.app/api/ebgs/v5/systems?allegiance=alliance&page=", "ALLIED"),
        ("https://elitebgs.app/api/ebgs/v5/systems?allegiance=independent&page=", "INDEPENDENT"),
    ]

    total_start_time = time.time()  # Record the start time for total duration

    await asyncio.gather(*(process_allegiance(url, allegiance) for url, allegiance in allegiance_urls))

    total_elapsed_time = time.time() - total_start_time
    total_minutes, total_seconds = divmod(total_elapsed_time, 60)
    print(f"TOTAL DURATION: {int(total_minutes):02d} minutes {total_seconds:.2f} seconds")

    sys.setrecursionlimit(1000)

if __name__ == "__main__":
    asyncio.run(main())
