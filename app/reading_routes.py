"""Real model-backed reading routes. Keys remain in main.py's server client."""
import json
import re
import os
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from openai import APIError, APITimeoutError, AuthenticationError, RateLimitError

router = APIRouter(prefix='/api')
OUTPUTS = Path(__file__).resolve().parent.parent
PROMPT = (OUTPUTS / '思想实验室-System-Prompt.md').read_text(encoding='utf-8').split('```text\n')[1].split('```')[0].strip()


class ReadingInput(BaseModel):
    model_config = ConfigDict(extra='ignore')
    book: str = Field(default='文心雕龙', max_length=200)
    edition: str = Field(default='', max_length=300)
    chapter: str = Field(default='', max_length=100)
    source_text: str = Field(min_length=1, max_length=12000)
    selected_text: str = Field(default='', max_length=2000)
    user_input: str = Field(default='', max_length=2000)
    conversation_history: list[dict] = Field(default_factory=list, max_length=20)
    current_path: str | None = None
    next_path: Literal['reality', 'critique', 'feynman'] = 'reality'
    interpretations: list[dict] = Field(default_factory=list, max_length=20)


class LabOutput(BaseModel):
    path: Literal['reality', 'critique', 'feynman']
    acknowledgment: str
    quote: str | None
    source_ref: str | None = None
    scaffold: str = ''
    question: str = Field(min_length=1)
    analogy_limit: str | None = None
    evidence_limit: str | None = None
    interpretation_ids: list[str] = Field(default_factory=list)
    next_path_hint: Literal['reality', 'critique', 'feynman']


class SkimOutput(BaseModel):
    quote: str = Field(min_length=1)
    sentence: str = Field(min_length=1)
    limit: str = ''


def client_for(request):
    client = request.app.state.openai_client
    if client is None:
        raise HTTPException(503, '尚未配置AI服务密钥，请联系维护者。')
    return client


def validate_input(payload):
    if not payload.source_text.strip():
        raise HTTPException(422, '请先选择一段原文。')
    if payload.selected_text and payload.selected_text not in payload.source_text:
        raise HTTPException(422, '划选内容不在当前原文中，请重新划选。')


async def generate_json(request, prompt, payload):
    try:
        completion = await client_for(request).chat.completions.create(
            model=os.getenv('OPENAI_MODEL', 'gpt-5'),
            messages=[{'role': 'system', 'content': prompt},
                      {'role': 'user', 'content': json.dumps(payload, ensure_ascii=False)}],
            response_format={'type': 'json_object'},
        )
    except AuthenticationError:
        raise HTTPException(502, '模型服务拒绝了密钥，请检查其有效期与权限。') from None
    except RateLimitError:
        raise HTTPException(429, '模型服务额度不足或请求过于频繁，请稍后重试。') from None
    except APITimeoutError:
        raise HTTPException(504, 'AI回复超时，请重试。') from None
    except APIError:
        raise HTTPException(502, '模型服务暂时不可用，请稍后重试。') from None
    if not completion.choices or not completion.choices[0].message.content:
        raise HTTPException(502, '模型没有返回可用内容。')
    try:
        return json.loads(completion.choices[0].message.content)
    except (ValueError, TypeError):
        raise HTTPException(502, 'AI输出格式未通过检查，请重试。') from None


@router.post('/thought-lab')
async def thought_lab(payload: ReadingInput, request: Request):
    validate_input(payload)
    # Only reviewed, server-owned records can enter the academic evidence list.
    reviewed = json.loads((OUTPUTS/'wenlun-web/dist/reviewed-interpretations.json').read_text(encoding='utf-8'))
    allowed = {v['id']: v for v in reviewed}
    chosen = [allowed[v['id']] for v in payload.interpretations if v.get('id') in allowed]
    body = payload.model_dump()
    body['interpretations'] = chosen
    body['conversation_history'] = payload.conversation_history[-6:]
    if len(json.dumps(body, ensure_ascii=False)) > 50000:
        raise HTTPException(413, '对话上下文过长，请换一个段落重新开始。')
    prompt = PROMPT + '\n当前路径建议由next_path提供。question必须以一个中文问号结束，且只能含一个问号。必须引用当前source_text中的一句原话；不能拼接。输出JSON。'
    data = await generate_json(request, prompt, body)
    try:
        result = LabOutput.model_validate(data)
    except ValidationError:
        raise HTTPException(502, 'AI回复结构未通过检查，请重试。') from None
    if not result.quote or result.quote not in payload.source_text:
        raise HTTPException(502, 'AI引句与原文不一致，本轮结果未展示，请重试。')
    if len(re.findall(r'[？?]', result.question)) != 1:
        raise HTTPException(502, 'AI未遵守单轮一个核心问题，本轮结果未展示，请重试。')
    if any(v not in {c['id'] for c in chosen} for v in result.interpretation_ids):
        raise HTTPException(502, 'AI引用了未经提供的学者观点，本轮结果未展示。')
    return {'mode': 'live', **result.model_dump()}


@router.post('/skim')
async def skim(payload: ReadingInput, request: Request):
    validate_input(payload)
    data = await generate_json(request,
        '你是严谨的古代文论伴读教师。把用户选中的长句或段落概括成一句通俗中文，保留主旨和必要限定，不作任意发挥。不补充原文没有给出的作者、作品、流派或年代；诗人、辞人等泛称保留为泛称，不擅自落实为具体作品或作者。不要把解释说成原文。quote必须是source_text中逐字存在的一句；不拼接、不改标点。输出JSON：{"quote":"原句","sentence":"一句白话","limit":"省略了哪些论证、类比或限定"}。sentence只含一个句末标点。',
        payload.model_dump())
    try:
        result = SkimOutput.model_validate(data)
    except ValidationError:
        raise HTTPException(502, 'AI跳读结果格式未通过检查，请重试。') from None
    if result.quote not in payload.source_text:
        raise HTTPException(502, 'AI跳读引句与原文不一致，请重试。')
    if len(re.findall(r'[。！？!?]', result.sentence)) > 1:
        raise HTTPException(502, 'AI跳读未压缩成一句话，请重试。')
    return {'mode': 'live', **result.model_dump()}
