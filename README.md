# AI 小说转剧本工具

将小说文本自动转换为结构化剧本（YAML 格式），帮助作者快速获得可编辑、可进一步打磨的剧本初稿。

## 功能

- 📖 支持 3 个章节以上的小说文本输入
- 🔄 **多步 Pipeline 转换**：分章抽取 → 人物识别 → 场景切分 → 对白转换 → 组装 YAML
- 📝 输出符合影视工业化标准的 YAML 剧本，包含镜头语言、灯光、情绪弧线等专业维度
- 🎬 面向 AI 视频生成预留扩展接口

## 技术栈

- 前端：React + TypeScript + TailwindCSS
- AI 引擎：DeepSeek API
- 输出格式：YAML（详见 [Schema 设计文档](docs/schema_design.md)）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
├── docs/
│   ├── schema_design.md      # YAML Schema 设计文档
│   └── example_script.yaml   # 示例剧本输出
├── src/
│   ├── components/           # React 组件
│   ├── pipeline/             # 多步转换 Pipeline
│   └── lib/                  # 工具函数
├── public/
└── README.md
```

## Schema

本工具输出的剧本格式详见 [Schema 设计文档](docs/schema_design.md)。

核心设计理念：
- **时间线驱动**：action 和 dialogue 在同一时间线中交替，忠实还原叙事节奏
- **面向影视工业**：包含镜头语言（camera）、灯光（lighting）、情绪弧线（emotional_arc）
- **面向 AI 视频**：预留结构化 prompt 接口，未来可对接 AI 视频生成模型

## License

MIT
