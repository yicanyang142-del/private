"""OpenAlex works ranked by citations, with reconstructed inverted-index abstracts."""
import json
import os
import re
from datetime import datetime, timezone
import httpx
from fastapi import HTTPException


def reconstruct_abstract(index):
    if not isinstance(index,dict) or not index:return None
    words={}
    for word,positions in index.items():
        if not isinstance(word,str) or not isinstance(positions,list):return None
        for position in positions:
            if type(position) is not int or position<0 or position>=20000 or position in words:return None
            words[position]=word
    if not words or sorted(words)!=list(range(len(words))):return None
    return ' '.join(words[i] for i in range(len(words)))


def normalize_works(results):
    papers=[];seen=set()
    for item in results:
        if not isinstance(item,dict) or item.get('is_retracted') is True:continue
        identifier=item.get('id','')
        if not isinstance(identifier,str) or not re.fullmatch(r'https://openalex.org/W\d+',identifier) or identifier in seen:continue
        seen.add(identifier)
        authors=[]
        for authorship in item.get('authorships') or []:
            if not isinstance(authorship,dict):continue
            author=authorship.get('author') or {}
            if isinstance(author,dict) and isinstance(author.get('display_name'),str):authors.append(author['display_name'])
        abstract=reconstruct_abstract(item.get('abstract_inverted_index'))
        title=item.get('title') or item.get('display_name') or '未提供标题'
        papers.append({'id':f'S{len(papers)+1}','openalex_id':identifier,'title':str(title)[:1000],
            'authors':authors,'year':item.get('publication_year'),'abstract':abstract,
            'has_abstract':bool(abstract),'cited_by_count':item.get('cited_by_count',0),
            'url':identifier,'domain':'openalex.org','doi':item.get('doi'),
            'snippet':abstract[:1600] if abstract else '',
            'evidence_type':'indexed_abstract','full_text_verified':False})
        if len(papers)==3:break
    return papers


def papers_to_context(papers):
    blocks=['OpenAlex research context — indexed abstracts, not full papers.',
            'Ranked by citation count; this is not an authority or relevance guarantee. Missing abstracts must not be invented.']
    for paper in papers:
        blocks.append('\n'.join([f"[{paper['id']}] Title: {paper['title']}",
            'Authors: '+('; '.join(paper['authors']) or 'Not provided'),
            'Year: '+str(paper['year'] or 'Not provided'),
            'Cited by: '+str(paper['cited_by_count']),
            'Abstract: '+(paper['abstract'] or 'Not available in OpenAlex; do not infer its claims.'),
            'Source: '+paper['url']]))
    return '\n\n'.join(blocks)


async def search_openalex(term,*,transport=None):
    term=' '.join(term.split())[:200]
    if not term:raise HTTPException(422,'请先划选一个术语')
    headers={'Accept':'application/json','User-Agent':'WenlunLocalReader/1.0'}
    key=os.getenv('OPENALEX_API_KEY','').strip()
    if key:headers['Authorization']='Bearer '+key
    params={'search':term,'sort':'cited_by_count:desc','per_page':3,
            'filter':'type:article,is_retracted:false',
            'select':'id,title,authorships,publication_year,abstract_inverted_index,cited_by_count,doi,is_retracted'}
    try:
        async with httpx.AsyncClient(timeout=20,transport=transport,follow_redirects=False) as client:
            response=await client.get('https://api.openalex.org/works',params=params,headers=headers)
    except httpx.TimeoutException:raise HTTPException(504,'OpenAlex 检索超时，尚未生成解答。') from None
    except httpx.HTTPError:raise HTTPException(502,'无法连接 OpenAlex，尚未生成解答。') from None
    if response.status_code in (401,403):raise HTTPException(503,'OpenAlex 要求有效密钥，请在本地 .env 配置 OPENALEX_API_KEY 后重启。')
    if response.status_code==429:raise HTTPException(429,'OpenAlex 请求过于频繁或额度不足，请稍后重试。')
    if not response.is_success:raise HTTPException(502,'OpenAlex 检索失败，尚未生成解答。')
    try:
        data=response.json()
        if not isinstance(data,dict) or not isinstance(data.get('results'),list):raise ValueError()
    except ValueError:raise HTTPException(502,'OpenAlex 返回格式异常。') from None
    papers=normalize_works(data['results'])
    return {'provider':'openalex','query':term,'status':'retrieved' if papers else 'no_results',
        'sources':papers,'context_text':papers_to_context(papers),
        'retrieved_at':datetime.now(timezone.utc).isoformat(),
        'notice':f'OpenAlex 按引用量返回{len(papers)}篇非撤稿期刊论文；{sum(p["has_abstract"] for p in papers)}篇有可用摘要。高引用不等于更权威或更相关；未核对全文。'}
