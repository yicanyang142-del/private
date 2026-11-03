# 在线搜书与术语论文背景

已更新本地 http://127.0.0.1:8765/ 。书架增加「发现一本经典」，随行导师的学术资料来源可选 OpenAlex 或原 Tavily。

## React 搜书组件

完整组件：`wenlun-web/dist/book-search.js`，网络请求与字段整理：`book-search.mjs`，样式：`book-search.css`。本项目直接使用本地 React `createElement`，无须额外构建。

```jsx
<BookSearch />
```

请求核心：

```js
const params = new URLSearchParams({
  q: keyword.trim(), limit: '12',
  fields: 'key,title,author_name,first_publish_year,ebook_access,ia',
});
const response = await fetch(
  `https://openlibrary.org/search.json?${params}`, { signal }
);
if (!response.ok) throw new Error('搜索服务暂时不可用');
const { docs } = await response.json();
```

组件使用500毫秒防抖，每次更换关键词清除定时器并通过 AbortController 取消旧请求，再用版本号拦截过期响应；空关键词不发请求。提供等待、加载、空结果、网络错误、限流和重试状态。书名/作者/年份缺失时有明确占位。

「开始阅读」对公开电子书打开 Internet Archive 来源页，其余打开 Open Library 作品页，由原站处理借阅和阅读权限。搜索 API 返回的是书目，不是全文，不会自动下载、绕过授权或导入本地阅读器；要使用本应用划线功能，仍需导入自己可使用的 TXT/PDF。

`first_publish_year` 依照 Open Library 书目数据展示，不能直接视为古代原著成书年份。在线检索词会发送给 Open Library，不需要在前端放密钥。

## OpenAlex 后端函数

完整函数：`app/openalex_search.py`。

```python
retrieval = await search_openalex('Simulacra')
papers = retrieval['sources']       # 最多3篇的结构化信息
context_text = retrieval['context_text']
```

请求 `https://api.openalex.org/works`，使用：

```python
params = {
    'search': term,
    'sort': 'cited_by_count:desc',
    'per_page': 3,
    'filter': 'type:article,is_retracted:false',
    'select': 'id,title,authorships,publication_year,abstract_inverted_index,cited_by_count,doi,is_retracted',
}
```

增加过滤是为了返回非撤稿期刊论文，而非把书籍或其他作品直接当论文；不绕过原查询的引用量排序。条数不足时不补编。

论文信息包含 `title`、`authors`、`year`、`abstract`、`cited_by_count`、`openalex_id` 和 `doi`。OpenAlex 摘要使用 `abstract_inverted_index` 倒排索引；`reconstruct_abstract` 按位置重排词语，遇到缺失、位置冲突或不完整索引时返回空值，不编写替代摘要。

背景文本格式为：

```text
[S1] Title: ...
Authors: ...
Year: ...
Cited by: ...
Abstract: ...（缺失时明确标注 Not available）
Source: https://openalex.org/W...
```

## 与模型连接

`POST /api/reader/discuss` 的请求中增加 `research_provider: "openalex"`（当前默认值），保留 `academic_search: true`。后端先核对本地原文与选区，然后检索，将 `retrieval` 放进模型用户消息的 `academic_context`，其中包含 `context_text` 和结构化论文信息；随后沿用学术引用校验和批注保存流程。

```python
retrieval = await search_openalex(payload.concept or payload.selected_text)
body['academic_context'] = retrieval
data = await generate_json(request, prompt + ACADEMIC_INSTRUCTIONS, body)
result = AcademicLabOutput.model_validate(data)
validate_citations(result, retrieval)
```

支持引句必须逐字属于对应来源的 `snippet`。没有摘要时只展示书目信息，不允许模型推断学派或论文论点。检索结果跨学科同名时，要求模型先判断与当前术语是否相关；资料不足以支持观点时明确标注不足。

**引用量是排序指标，不等于权威性或语义相关性。** 例如 Simulacra 可能同时命中其他学科，不能把它们直接当成鲍德里亚研究。摘要也不等于论文全文。

## 密钥与失败处理

OpenAlex 当前支持匿名访问，但匿名额度有限。本轮真实请求返回429，未取得可用于真实模型验收的论文结果；后续一次命令行重试还遇到网络连接错误。模拟测试不能当作真实成功。

可在 [OpenAlex 账户设置](https://openalex.org/settings/api) 获取个人 API Key，在本地 `.env` 填入后重启：

```dotenv
OPENALEX_API_KEY=你的OpenAlex密钥
```

后端通过 Authorization 请求头发送密钥，不拼进网址、不发给浏览器。OpenAlex 模式不需要 Tavily Key；Tavily 模式仍使用原 `TAVILY_API_KEY`。密钥缺失导致鉴权失败、429限流、网络超时及无摘要均有独立处理，不用假论文兜底。

## 验证

- 搜书纯函数3项测试、后端19项测试通过，覆盖排序参数、作者与年份、摘要重建、缺失摘要、结构化 Context 传给模型及错误脱敏。
- 已在真实浏览器搜索 Poetics，显示亚里士多德及其他相关书籍、作者、初版年份、来源阅读链接。
- OpenAlex 真实端到端尚未通过，原因见上述限流与网络状态。配置个人额度后运行 `scripts/verify_catalog_apis.py` 可再次验证两个公开词查询；该脚本不读取本地原著、不调用模型。

参考：[Open Library Search API](https://openlibrary.org/dev/docs/api/search)、[OpenAlex API](https://help.openalex.org/api/)、[OpenAlex 鉴权](https://help.openalex.org/api/authentication/)。
