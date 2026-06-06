import { useState, useCallback } from 'react';
import { convertNovel } from './lib/deepseek';
import { runPipeline, type PipelineProgress } from './pipeline';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(`# 剧本将在此处生成...

# 粘贴小说文本后点击“开始转换”`);
  const [chapterCount, setChapterCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usePipeline, setUsePipeline] = useState(true);
  const [progress, setProgress] = useState<PipelineProgress | null>(null);

  const hasKey = Boolean(API_KEY && API_KEY !== 'your_deepseek_api_key_here');

  const handleConvert = useCallback(async () => {
    if (!hasKey || !API_KEY) return;
    setError('');
    setLoading(true);
    setProgress(null);

    try {
      if (usePipeline) {
        const result = await runPipeline(
          input,
          chapterCount,
          API_KEY,
          (p) => setProgress(p)
        );
        setOutput(result);
      } else {
        setOutput(`# 转换中，请稍候...`);
        const result = await convertNovel(input, chapterCount, API_KEY);
        if (result.error) {
          setError(result.error);
          setOutput(`# 转换失败`);
        } else {
          setOutput(result.yaml);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      setOutput(`# 转换失败`);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [input, chapterCount, hasKey, API_KEY, usePipeline]);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
        <h1 className="text-xl font-bold tracking-tight">
          AI 小说转剧本工具
        </h1>
        <span className="text-sm text-gray-500">v0.3.0</span>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <section className="w-1/2 flex flex-col border-r border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              小说原文
            </h2>
          </div>
          <textarea
            className="flex-1 p-4 bg-gray-900 text-gray-200 resize-none outline-none placeholder-gray-600 text-sm leading-relaxed font-mono"
            placeholder="在此粘贴小说章节内容（支持 3 个章节以上）..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </section>

        <section className="w-1/2 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              剧本输出（YAML）
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors">
                复制
              </button>
              <button className="px-3 py-1 text-xs rounded bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors">
                下载
              </button>
            </div>
          </div>

          {progress && (
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>
                  步骤 {progress.step}/{progress.total}: {progress.label}
                </span>
                <span>{Math.round(((progress.step - 1) / progress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 animate-pulse"
                  style={{ width: `${((progress.step - 1) / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <pre className="flex-1 p-4 bg-gray-900 text-green-400 overflow-auto text-sm leading-relaxed font-mono whitespace-pre-wrap">
            {output}
          </pre>
        </section>
      </main>

      <footer className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-500">
            章节数：
            <input
              type="number"
              min={3}
              value={chapterCount}
              onChange={(e) => setChapterCount(Math.max(3, Number(e.target.value)))}
              className="ml-2 w-16 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-200 text-sm"
            />
          </label>

          <button
            onClick={() => setUsePipeline(!usePipeline)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              usePipeline
                ? 'bg-blue-900 text-blue-300 border border-blue-700'
                : 'bg-gray-800 text-gray-500 border border-gray-700'
            }`}
          >
            {usePipeline ? 'Pipeline: ON' : 'Pipeline: OFF'}
          </button>

          {input.trim().length > 0 && input.trim().length < 500 && (
            <span className="text-xs text-yellow-500">
              {'⚠'} {'文本较短（'}
              {input.trim().length}
              {'字），建议至少输入 500 字以上小说内容'}
            </span>
          )}
          {!hasKey && (
            <span className="text-xs text-yellow-500">
              ⚠ 请将 .env.example 复制为 .env 并填入 DeepSeek API Key
            </span>
          )}
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
        </div>
        <button
          onClick={handleConvert}
          disabled={!hasKey || loading || !input.trim()}
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          {loading ? '转换中...' : '开始转换'}
        </button>
      </footer>
    </div>
  );
}

export default App;
