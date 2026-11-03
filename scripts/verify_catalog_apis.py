"""Only public search terms; no book uploads or model calls."""
import asyncio
import json
import sys
from pathlib import Path
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'app'))
load_dotenv(ROOT/'.env')
from openalex_search import search_openalex
from config import DATA_DIR

async def main():
    report={}
    try:
        async with httpx.AsyncClient(timeout=30,follow_redirects=False) as client:
            response=await client.get('https://openlibrary.org/search.json',params={'q':'Poetics','limit':3,'fields':'key,title,author_name,first_publish_year,ebook_access,ia'})
            response.raise_for_status();report['openlibrary']=response.json()
    except httpx.HTTPError:
        report['openlibrary']={'verified':False,'detail':'Network request failed'}
    try:
        report['openalex']=await search_openalex('Simulacra')
    except HTTPException as error:
        report['openalex']={'verified':False,'http_status':error.status_code,'detail':error.detail}
    (DATA_DIR/'catalog-apis-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Open Library results:',len(report['openlibrary'].get('docs',[])))
    print('OpenAlex:',len(report['openalex']['sources']) if 'sources' in report['openalex'] else report['openalex'])

if __name__=='__main__':asyncio.run(main())
