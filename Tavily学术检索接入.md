# 学术检索增强解答

已接入动态阅读器的 `POST /api/reader/discuss`。核心代码在 `app/academic_search.py`，路由编排在 `app/dynamic_routes.py`，来源展示在 `wenlun-web/dist/dynamic-reader.js`。原 `/chat`、旧版导读 `/api/thought-lab`、跳读及问题卡片生成接口保持原有职责；本轮增强的是划线后的随行导师解答。

## 先配置密钥

Tavily 搜索密钥与原来的大模型密钥不是同一个。到 [Tavily 控制台](https://app.tavily.com/) 取得自己的 API Key，填进本项目本地 `.env`：

```dotenv
SUPER_MIND_API_KEY=原有的大模型密钥
TAVILY_API_KEY=你的Tavily密钥
```

不要把真实 Key 写进源码、前端或聊天。`.env` 已被 Git 忽略。修改后先 Ctrl+C 关闭服务，再运行项目的 `start.ps1`。无需安装 Tavily SDK，使用现有 `httpx` 直接调用官方 REST 接口。

## 实际流程

1. 后端先核对书籍和选区，确认偏移、文字与本地正文一致。
2. 从选中的概念和问题构造短检索词，例如 `风骨 风骨如何理解 文论 美学 概念 学术研究 论文 理论观点`。不把整页、书名或历史对话发送给 Tavily；短选区和问题仍会被发给第三方搜索服务。
3. `POST https://api.tavily.com/search` 使用 `search_depth=advanced`、`topic=general`、`include_answer=false`，在可配置学术域名中取前10个候选。
4. 过滤 HTTPS 来源、域名、重复网址、重复摘要和过短内容，按检索排序保留最多3条，生成 `S1`、`S2`、`S3`。条数不足时不补编；完全无合格来源时停止生成并提示调整概念。
5. 把这些检索摘要、选区及必要原文上下文一起发送给模型。让模型区分原文、学术观点与现代类比，先解释后追问；有不同观点时并列呈现，不强凑三种流派。
6. 检查模型引用编号和支持引句，再返回后端持有的真实来源链接。批注保存时，观点、引句、检索时间、摘要与链接一起保存在原 SQLite 注解 JSON 中。

## 核心后端调用

下面是已实现流程的简化摘录；完整错误处理、校验与 schema 见上述文件：

```python
query = build_query(payload.selected_text,
                    payload.user_message or payload.question,
                    payload.concept)
retrieval = await search_academic(query)
if not retrieval['sources']:
    raise HTTPException(424, '未找到合格学术资料，本轮不生成解答')

body['academic_context'] = retrieval
data = await generate_json(request, original_prompt + ACADEMIC_INSTRUCTIONS, body)
result = AcademicLabOutput.model_validate(data)
validate_citations(result, retrieval)
# 之后继续核对原书引句、单个追问和证据边界，再由后端附上 sources。
```

检索直接调用官方 API：

```python
async with httpx.AsyncClient(timeout=20) as client:
    response = await client.post(
        'https://api.tavily.com/search',
        headers={'Authorization': 'Bearer ' + os.environ['TAVILY_API_KEY']},
        json={
            'query': query,
            'topic': 'general',
            'search_depth': 'advanced',
            'max_results': 10,
            'include_domains': list(DOMAINS),
            'include_answer': False,
            'include_raw_content': False,
            'include_images': False,
        },
    )
```

## 模型输出与可核查引用

原有 `quote` 仍是阅读页中的逐字原句，`scaffold` 为分析，`question` 为一个追问。新增：

```json
{
  "scholarly_views": [{
    "perspective": "由资料明确支持的观点或研究取向",
    "claim": "具有解释边界的观点说明",
    "source_ids": ["S1"],
    "evidence": [{"source_id":"S1", "quote":"S1摘要中逐字存在的支持引句"}]
  }],
  "citations": ["S1"],
  "evidence_limit": "当前仅依据检索摘要，尚未核对论文全文。"
}
```

编号不在检索列表中、没有对应支持引句、引句不属于摘要、模型杜撰网址或原书引句不匹配时，结果会被拒绝。正文的 `[S1]` 编号可与「学术检索来源」对应；链接和摘要由后端返回，不由模型生成。

这些检查验证的是**引用可追溯和引句一致**，无法自动证明“这段引句足以支持该推论”，也不能保证某个域名下的全部内容都是经过同行评审的论文。高校页面、学术机构网页与付费论文的检索摘要必须保留不同证据边界。不会声称阅读了全文；不会因为一份摘要就宣布学术定论。

网页摘要和历史对话作为不可信材料处理，不执行其中的指令。前端用 React 文本节点渲染，来源链接只接受后端过滤后的 HTTPS 学术域名。

## 前端与请求开关

随行导师默认勾选「回答前检索学术来源」。未配置 Key 会提示具体配置位置；不自动降级。用户明确取消勾选后，`academic_search=false`，只进行原文讨论并标明未检索外部来源。

除原有选区字段外，请求可包含：

```json
{"academic_search": true, "concept":"风骨", "user_message":"风骨有哪些解释分歧？"}
```

`concept` 是可选的精准检索词，未提供时使用短选区。选问题后展开分析也走同一检索链路。三张启发问题的生成不进行 Tavily 搜索，因为该步骤尚不生成学派解答。

域名列表、超时、候选数、摘要长度及最终条数集中在 `config.toml` 的 `[academic_search]`；目前最多3条最终来源。搜索失败、超时、配额不足分别返回清晰错误，不把异常响应体或密钥传给浏览器。

## 验收状态

已通过15项本地测试，包括模拟 Tavily HTTP 响应、请求参数与鉴权、最多3来源、去重、防伪造域名、先检索后生成、摘要支持引句、非法编号、密钥缺失、无来源时不调用模型，以及保存批注后仍带来源。

当前未提供 Tavily Key，因此**尚未完成真实 Tavily → 模型的联网端到端验收**，不能将模拟测试当作真实搜索结果。

填好 Key 并重启后，划选「风骨」等具体概念，在随行导师输入问题。检查：有出处的观点、可展开的学术来源、链接能打开、引句能与摘要核对；保存后刷新，「我的批注」仍保留这些来源。对付费文献的摘要仍需自行核对全文。

接口依据：[Tavily 官方 Search API](https://docs.tavily.com/documentation/api-reference/endpoint/search)。
