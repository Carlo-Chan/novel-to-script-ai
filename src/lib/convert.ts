import type { AppSettings } from "./settings";
import { buildApiUrl } from "./settings";

interface ConversionResult {
  yaml: string;
  error?: string;
}

export async function convertNovel(
  text: string,
  chapterCount: number,
  settings: AppSettings
): Promise<ConversionResult> {
  if (!text.trim()) {
    return { yaml: "", error: "请输入小说文本" };
  }

const systemPrompt = `你是一位资深的影视编剧和剧本医生。请将用户提供的小说章节文本转换为结构化的 YAML 剧本。

## 输出要求

严格按照以下 YAML Schema 输出，不要遗漏任何字段，不要添加额外解释文字，只输出 YAML：

\`\`\`yaml
meta:
  title: "原著标题"
  original_author: "原作者"
  adaptor: "AI 小说转剧本工具"
  version: "1.0"
  source_chapters: [${Array.from({ length: chapterCount }, (_, i) => i + 1).join(", ")}]
  genre: "推测类型"
  total_scenes: N

characters:
  - id: ROLE_ID
    name: "角色名"
    aliases: ["昵称"]
    role: "主角/配角"
    age: N
    gender: "男/女"
    occupation: "职业"
    personality: ["标签1", "标签2"]
    description: "一句话介绍"

scenes:
  - id: 1
    slug: "简短标题"
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
        description: "动作/环境描述"
        camera: "镜头语言(可选)"
        lighting: "灯光风格(可选)"
      - type: dialogue
        character: ROLE_ID
        line: "对白内容"
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
      reference: "参考曲目"
  missing_context: "缺失上下文说明"
\`\`\`

## 转换规则

1. **人物提取**：识别所有有名有姓的角色，为每人创建唯一 id（英文大写+下划线），列出别名和外号
2. **场景切分**：按地点/时间变化切分场景，每个场景必须有 mood 和 emotional_arc
3. **叙事转画面**：将小说描写转为 action 类型元素；环境描写保留 camera 和 lighting 提示
4. **对白提取**：将引号内的对话转为 dialogue，添加 emotion 和 parenthetical（表演提示）
5. **内心独白**：非对话的心理描写转为 voiceover
6. **改编建议**：在 adaptation_notes 中标注节奏问题、缺失上下文、建议 BGM 风格

## 注意事项
- 对白保持原文风格，不要过度改写
- 年龄推测：如果原文未明确角色年龄，根据身份、辈分、职业和语境合理推测（如“父亲”推测 45-55，“大学生”推测 20-22）。在 age 值后添加 YAML 注释标注，格式：age: 45  # 推测。严禁输出 age: 0
- 别名提取：务必识别角色的所有称呼（外号、敬称、亲属称谓），填入 aliases 列表
- emotion 用中文（如"愤怒""温柔""冷漠"）
- camera 取值：establishing/wide/two-shot/close-up/pov/tracking
- lighting 取值：high-key/low-key/silhouette/natural/neon
- 作品标题：区分章节标题与小说原名。如原文以章节标题开头（如"第一章 XXX"），不要将其作为 meta.title。尝试从序言、简介或上下文推断真正的小说名；若无法确定，标注"未知"
- 所有字符串值（除数字和布尔外）必须用双引号包裹，如 name: "徐来"
- 如果原文某信息确实缺失且无法推测（如少量路人角色），留空或标注 N/A。对于主要角色，务必推测年龄`;


  try {
    const apiUrl = buildApiUrl(settings.baseUrl);
    const modelCfg = settings.models.singleShot;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + settings.apiKey,
      },
      body: JSON.stringify({
        model: modelCfg.model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "请将以下小说章节转换为剧本 YAML：\n\n" + text,
          },
        ],
        temperature: 0.7,
        max_tokens: modelCfg.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg =
        (errorData as { error?: { message?: string } }).error?.message ||
        "API 请求失败 (" + response.status + ")";
      return { yaml: "", error: msg };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let yaml = content
      .replace(/^```ya?ml?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    return { yaml };
  } catch {
    return { yaml: "", error: "网络请求失败，请检查网络连接或 API Key 是否正确" };
  }
}
