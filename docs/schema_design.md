# 剧本 YAML Schema 设计文档

## 一、概述

本文档定义了「AI 小说转剧本工具」输出的 YAML 剧本格式规范。该 Schema 旨在成为小说文本与影视制作之间的结构化桥梁：既保留剧本创作的文学性，又满足工业制作的可解析性。

## 二、设计原则

### 2.1 为什么选择 YAML 而非 JSON

- **人类可读性优先**：剧本的最终消费者是编剧、导演、演员。YAML 的缩进层级天然像大纲/剧本分场格式，非技术人员也能直接打开修改。
- **避免语法噪音**：没有 JSON 的大量花括号和引号，创作者注意力保持在内容本身。
- **注释支持**：YAML 原生 `#` 注释允许编剧标注修改意图，这在协作中至关重要。
- **多文档支持**：YAML 的 `---` 分隔符天然支持一章对应一个文档块。

### 2.2 核心理念：时间线驱动

传统剧本格式（如好莱坞标准）将「动作描述」和「对白」作为独立段落排列。但剧本本质是**时间线上交替出现的画面与声音**。因此本 Schema 采用 `elements` 列表来承载时序信息，action 和 dialogue 在同一列表中交替出现，忠实还原叙事节奏。

### 2.3 面向 AI 视频生成的扩展性

本 Schema 预留了 `camera`、`lighting`、`emotional_arc` 等字段。虽然当前阶段 AI 视频生成（如 Sora）尚不支持通过结构化数据精确控制镜头，但这些字段为未来对接预留了语义接口，同时也帮助人类导演理解改编意图。

---

## 三、Schema 完整定义

```yaml
# ============================================================
# 剧本 YAML Schema v1.0
# ============================================================

# ─── 元信息 ─────────────────────────────────────────────────
meta:
  title: "原著小说名"           # 必填，原著标题
  original_author: "原作者"     # 必填
  adaptor: "改编者/工具"        # 必填
  version: "1.0"                # 必填，Schema 版本号
  source_chapters: [1, 2, 3]    # 必填，改编覆盖的原文章节
  genre: "悬疑"                 # 可选，类型标签
  total_scenes: 12              # 自动生成，场景总数

# ─── 人物表 ─────────────────────────────────────────────────
characters:
  - id: LIN_XIAO               # 必填，唯一标识符（大写英文+下划线）
    name: "林晓"                # 必填，角色姓名
    aliases: ["小林"]           # 可选，别名/昵称，用于小说文本匹配
    role: "主角"                # 主角/配角/反派/路人
    age: 28                     # 可选
    gender: "男"                # 可选
    occupation: "刑警"          # 可选
    personality: ["冷静", "执着", "话少"]   # 可选，性格标签
    description: "市刑警队骨干，因三年前的一桩悬案始终无法释怀。"  # 可选
    relationships:              # 可选，与其他角色的关系
      - target: CHEN_YU
        relation: "搭档"
        dynamic: "亦师亦友，互相信任"
    first_appearance_scene: 1   # 可选，首次出场场景编号

# ─── 场景列表 ─────────────────────────────────────────────────
scenes:
  - id: 1                       # 必填，场景序号
    slug: "废弃厂房-初次交锋"   # 可选，简短标题，便于跳转
    location: "城郊废弃化工厂 - 二楼车间"
    time: "深夜 23:30"
    weather: "小雨"             # 可选
    mood: "压抑、不安"          # 必填，本场景的情绪基调
    emotional_arc:               # 可选，本场景内情绪的起点→终点
      start: "紧张"
      end: "震惊"
    characters_present:          # 本场景出场角色
      - LIN_XIAO
      - CHEN_YU
      - UNKNOWN_MAN
    summary: "林晓和陈宇深夜突袭废弃工厂，发现了意想不到的线索。"  # 必填
    # ─── 时间线元素 ───
    elements:
      # 元素类型一：动作/画面描述
      - type: action
        description: "雨滴敲打铁皮屋顶，水珠从破裂的天花板滴落。车间深处有微弱的灯光摇曳。"
        camera: "establishing"           # 可选，镜头语言
        lighting: "low-key"              # 可选，低光照/高对比度
        duration_seconds: 8              # 可选，预估时长

      - type: action
        description: "林晓推开生锈的铁门，手电筒光束扫过布满灰尘的机床。"

      # 元素类型二：角色对白
      - type: dialogue
        character: LIN_XIAO
        line: "分头搜。有任何动静，对讲机联系。"
        parenthetical: "（压低声音，手按在枪套上）"  # 可选，表演提示
        delivery: "whisper"              # 可选，台词交付方式
        emotion: "警觉"                  # 可选，台词情绪

      - type: action
        description: "陈宇点了点头，向左侧走廊走去。脚步声在空旷的车间里回响。"

      - type: dialogue
        character: CHEN_YU
        line: "等等——你看这里。"
        parenthetical: "（蹲下，用手电照地面）"

      - type: action
        description: "地面上，一滩暗红色的液体尚未完全凝固。一串脚印延伸向黑暗中。"

      # 元素类型三：内心独白/画外音
      - type: voiceover
        character: LIN_XIAO
        line: "三年了。同一个手法，同一种痕迹。他回来了。"
        emotion: "压抑的愤怒"

      - type: action
        description: "车间深处传来金属碰撞声。林晓和陈宇同时拔枪。"
        camera: "two-shot"
        lighting: "silhouette"

      - type: action
        description: "【场景结束】"

# ─── 剧本全局建议 ───────────────────────────────────────────
adaptation_notes:
  pacing_analysis: "整体节奏前松后紧，建议第 2-4 章合并为一个场景以加快前期推进。"
  suggested_bgm:
    - scene: 1
      style: "ambient-tension"
      reference: "类似《真探》原声带 low drone"
  missing_context: "小说中林晓三年前的案件在第 5 章才揭露，改编前 4 场时需在人物动作中埋下伏笔。"
```

---

## 四、字段详解与设计理由

### 4.1 `characters` —— 人物表

| 字段 | 设计理由 |
|---|---|
| `id` | 全局唯一标识符，避免中文名重名（如「阿强」可能指代多人）。采用 `ROLE_ENUM` 风格，兼容代码查询。 |
| `aliases` | 小说中同一人物常有多个称呼（外号、敬称、昵称）。该字段用于文本匹配阶段，将小说中所有称呼映射到同一角色。 |
| `relationships` | 提前定义人物关系图，帮助 AI 在对话转换时判断语气（下属对上司不会说「喂你给我过来」）。 |
| `first_appearance_scene` | 告诉导演此角色何时登场，便于排戏。 |

### 4.2 `scenes` —— 场景

| 字段 | 设计理由 |
|---|---|
| `slug` | 人类可读的简短标题。在多人协作中，说「废弃厂房那场」比说「第 3 场」更高效。 |
| `mood` + `emotional_arc` | 传统剧本用文字描述情绪，此处做结构化编码，便于后期自动化分析全剧的情绪曲线。 |
| `characters_present` | 显式列出，让灯光/服装组一目了然。 |

### 4.3 `elements` —— 时间线元素

这是本 Schema 最核心的设计决策。

**为什么把 action 和 dialogue 放在同一个列表中，而非分成两个独立数组？**

传统 JSON Schema 倾向于：
```json
{ "actions": [...], "dialogues": [...] }
```

这看似结构清晰，但**丢失了时序关系**——你不知道两句对白之间发生了什么动作，也不知道一个动作之后谁说了什么。对编剧和导演来说，时序就是一切。

采用 `elements` 列表（action / dialogue / voiceover 三种类型交替排列），直接对应拍摄脚本的分镜表。剪辑师可以逐元素地理解「发生了什么→谁说了什么→又发生了什么」。

| 元素类型 | 用途 |
|---|---|
| `action` | 画面描述、动作、环境变化。可附带 `camera` 和 `lighting` 提示。 |
| `dialogue` | 角色对白。必须指定 `character`（引用人物表的 `id`）。 |
| `voiceover` | 画外音/内心独白。与 dialogue 区分开，因为录音和混音方式不同。 |

### 4.4 `camera` 与 `lighting` —— 镜头与灯光

| `camera` 取值 | 含义 |
|---|---|
| `establishing` | 定场镜头，交代环境全貌 |
| `wide` | 全景 |
| `two-shot` | 双人中景 |
| `close-up` | 特写 |
| `pov` | 主观视角 |
| `tracking` | 跟拍 |

| `lighting` 取值 | 含义 |
|---|---|
| `high-key` | 高调光，明亮均匀（喜剧/日常） |
| `low-key` | 低调光，高对比（悬疑/黑色电影） |
| `silhouette` | 剪影 |
| `natural` | 自然光 |
| `neon` | 霓虹光（赛博朋克/都市夜景） |

这些字段并非 AI 自动生成（当前 LLM 对此判断不可靠），但在 Schema 中预留了两个入口：
1. AI 根据文本情绪给出**建议值**（如：夜晚雨景→`low-key`）
2. 编剧手动调整后，这些值可以指导剪辑/拍摄

### 4.5 `adaptation_notes` —— 改编建议

区别于正文的剧本内容，这是一个**元信息层**：AI 在生成剧本过程中发现的疑问、建议、缺失上下文，都记录于此。这让工具不仅是「转换器」，更是「创作参谋」。

---

## 五、与好莱坞标准剧本格式的对应关系

| 好莱坞格式 | 本 Schema 对应字段 |
|---|---|
| Scene Heading（场景标题） | `location` + `time` |
| Action（动作描述） | `elements[type=action].description` |
| Character（角色名，对白前居中大写） | `elements[type=dialogue].character` |
| Parenthetical（括号表演提示） | `elements[type=dialogue].parenthetical` |
| Dialogue（对白文本） | `elements[type=dialogue].line` |
| Transition（转场标记） | 暂不纳入，由渲染层处理 |
| Shot（镜头标记） | `elements[type=action].camera` |
| (O.S.) / (V.O.) | `elements[type=voiceover]` 和 `elements[type=dialogue]` 区分 |

---

## 六、扩展性与未来方向

1. **多语言支持**：`meta` 中可添加 `language` 字段，`characters.name` 可增加 `i18n` 子对象。
2. **分镜脚本生成**：未来可基于 `elements` 列表自动生成故事板（storyboard）JSON。
3. **AI 视频生成对接**：当视频生成模型支持结构化 prompt 时，每个 scene 可直接序列化为 prompt 模板。
4. **协作版本控制**：YAML 文件天然适合 Git diff，可追踪每个 scene 的修改历史。

---

## 七、总结

本 Schema 在「人类可读性」和「机器可解析性」之间取得平衡。它不是简单地「把小说对白提取出来排成剧本」，而是试图在**叙事结构**、**视听话**、**制作信息**三个层面同时编码。这让它既是一份编剧可以直接阅读的剧本，也是一个可以被下游工具（剪辑软件、分镜生成器、AI 视频模型）消费的数据结构。
