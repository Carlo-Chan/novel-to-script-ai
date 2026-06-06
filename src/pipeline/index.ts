const API_URL = "https://api.deepseek.com/v1/chat/completions";

export interface PipelineProgress {
  step: number;
  total: number;
  label: string;
}

async function callDeepSeek(
  systemPrompt: string,
  userMessage: string,
  model: "deepseek-v4-flash" | "deepseek-v4-pro",
  maxTokens: number,
  apiKey: string
): Promise<string> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: model === "deepseek-v4-flash" ? 0.3 : 0.5,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ||
        `API 错误 (${response.status})`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

const STEP1_PROMPT = `你是一位文学分析师。请从以下小说文本中提取所有有名有姓的角色。

对每个角色，输出 YAML 列表格式：
- id: 大写英文+下划线的唯一标识（如 XU_LAI）
- name: 全名
- aliases: 文中出现的所有称呼、外号、敬称、亲属称谓
- role: 主角/配角/反派/路人
- age: 根据上下文推测，格式：age: 45  # 推测，严禁输出 age: 0，主要角色务必推测
- gender: 男/女/未知
- occupation: 职业（如有提及）
- personality: 2-4个性格关键词（中文）
- description: 一句话介绍

仅输出 YAML 列表，不要额外解释。`;

const STEP2_PROMPT = `你是一位影视剧本分析师。根据以下角色列表和小说原文，识别所有独立的场景。

判断新场景开始的规则：
- 地点发生变化
- 时间明显跳跃
- 新一组角色登场

对每个场景，输出：
- id: 从 1 开始的序号
- slug: 简短标题
- location: 具体地点
- time: 时间描述（如"深夜 23:30"）
- mood: 1-2个中文词的情绪基调
- characters_present: 出场角色 ID 列表
- summary: 一句话中文场景概要
- key_moments: 2-3个关键事件点

仅输出 YAML 列表，不要额外解释。`;

const STEP3_PROMPT = `你是一位资深影视编剧。请将以下小说文本转换为完整的 YAML 结构剧本。

首先，参考已完成的角色分析和场景切分：
---
{context}
---

输出必须严格使用以下 YAML 结构，不得自行发明字段名：

meta:
  title: "原著标题"
  original_author: "原作者"
  adaptor: "AI 小说转剧本工具"
  version: "1.0"
  source_chapters: [1, 2, 3]
  genre: "推测类型"
  total_scenes: N

characters:
  - id: ROLE_ID
    name: "角色名"
    aliases: ["别名"]
    role: "主角/配角/反派/路人"
    age: N  # 推测
    gender: "男/女"
    occupation: "职业"
    personality: ["标签1", "标签2"]
    description: "一句话介绍"

scenes:
  - id: 1
    slug: "短标题"
    location: "具体地点"
    time: "时间描述"
    mood: "情绪基调"
    emotional_arc:
      start: "起始情绪"
      end: "结束情绪"
    characters_present: [ROLE_ID]
    summary: "场景概要"
    elements:
      - type: action
        description: "动作/环境描写"
        camera: "establishing"
        lighting: "low-key"
      - type: dialogue
        character: ROLE_ID
        line: "对白"
        parenthetical: "(表演提示)"
        emotion: "情绪"
      - type: voiceover
        character: ROLE_ID
        line: "内心独白"
        emotion: "情绪"

adaptation_notes:
  pacing_analysis: "节奏分析"
  suggested_bgm:
    - scene: 1
      style: "音乐风格"
      reference: "参考"
  missing_context: "缺失上下文"

转换规则：
1. 必须使用上述字段名，不得使用 scene_id、scene_heading 等自创字段
2. sections 顺序必须为 meta → characters → scenes → adaptation_notes
3. 叙事转 action，对话转 dialogue，心理描写转 voiceover
4. camera: establishing/wide/two-shot/close-up/pov/tracking
5. lighting: high-key/low-key/silhouette/natural/neon
6. emotion 用中文（如"愤怒""温柔""冷漠"）
7. 角色年龄未明确时务必推测，标注 age: 45  # 推测，严禁 age: 0
8. 识别所有角色别名填入 aliases
9. 作品标题：区分章节标题与小说原名。如原文以章节标题开头（如"第一章 XXX"），不要将其作为 meta.title。尝试从序言、简介或上下文推断真正的小说名；若无法确定，标注"未知"
10. 所有字符串值（除数字和布尔外）必须用双引号包裹，如 name: "徐来"、mood: "压抑"
11. 仅输出 YAML，不要 Markdown 代码块包裹`;

export async function runPipeline(
  novelText: string,
  chapterCount: number,
  apiKey: string,
  onProgress: (p: PipelineProgress) => void
): Promise<string> {
  const cleanText = novelText.trim();
  if (!cleanText) throw new Error("请输入小说文本");

  // 第一步：提取角色信息（Flash，快速）
  onProgress({ step: 1, total: 3, label: "正在提取人物档案..." });
  const charactersYaml = await callDeepSeek(
    STEP1_PROMPT,
    `从以下小说（${chapterCount}章）中提取所有角色：\n\n${cleanText}`,
    "deepseek-v4-flash",
    2048,
    apiKey
  );

  // 第二步：识别场景拆分（Flash，快速）
  onProgress({ step: 2, total: 3, label: "正在识别场景边界..." });
  const scenesYaml = await callDeepSeek(
    STEP2_PROMPT,
    `角色列表：\n${charactersYaml}\n\n小说原文：\n${cleanText}`,
    "deepseek-v4-flash",
    4096,
    apiKey
  );

  // 第三步：生成完整剧本（Pro，高质量）
  onProgress({ step: 3, total: 3, label: "正在生成剧本YAML..." });
  const context = [
    "## 角色表",
    charactersYaml,
    "",
    "## 场景切分",
    scenesYaml,
  ].join("\n");

  const finalYaml = await callDeepSeek(
    STEP3_PROMPT.replace("{context}", context),
    `将以下小说（${chapterCount}章）转换为完整 YAML 剧本：\n\n${cleanText}`,
    "deepseek-v4-pro",
    16384,
    apiKey
  );

  // 去除可能包裹的 markdown 代码块标记
  const cleaned = finalYaml.replace(/^```ya?ml?\n?/i, "").replace(/\n?```$/i, "");
  return cleaned.trim();
}
