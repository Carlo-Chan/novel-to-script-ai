import type { AppSettings } from './settings';
import { buildApiUrl } from './settings';

export async function refineScript(
  currentYaml: string,
  instruction: string,
  settings: AppSettings
): Promise<string> {
  const apiUrl = buildApiUrl(settings.baseUrl);
  const modelCfg = settings.models.refine;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + settings.apiKey,
    },
    body: JSON.stringify({
      model: modelCfg.model,
      messages: [
        {
          role: 'system',
          content: `你是一位资深影视编剧，任务是按用户指令精确修改已有 YAML 剧本。

修改规则：
1. 仅修改与指令直接相关的字段，其他所有字段（包括未提及的角色、场景、元素）原样保留
2. 不得自行发明新字段名、不得改变 sections 顺序（meta / characters / scenes / adaptation_notes）
3. camera 仅限：establishing / wide / two-shot / close-up / pov / tracking
4. lighting 仅限：high-key / low-key / silhouette / natural / neon
5. 所有字符串值使用双引号包裹
6. 不要添加或删除整个 scenes 条目，除非用户明确要求
7. 仅输出完整 YAML，不要 Markdown 代码块包裹`,
        },
        {
          role: 'user',
          content: `当前剧本 YAML：
\`\`\`yaml
${currentYaml}
\`\`\`

修改指令：${instruction}`,
        },
      ],
      temperature: 0.5,
      max_tokens: modelCfg.maxTokens,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message || `API \u9519\u8BEF (${response.status})`
    );
  }

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content || '';

  // 去除 markdown 代码块标记
  let cleaned = result;
  const nl = cleaned.indexOf(String.fromCharCode(10));
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(nl + 1);
  const trimmed = cleaned.trimEnd();
  if (trimmed.endsWith('```')) cleaned = cleaned.slice(0, trimmed.lastIndexOf('```')).trimEnd();

  return cleaned.trim();
}
