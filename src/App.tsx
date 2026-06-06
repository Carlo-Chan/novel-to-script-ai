import { useState, useCallback } from 'react';
import { convertNovel } from './lib/deepseek';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(
    '# 剧本将在此处生成...\n' +
    '\n' +
    '# 粘贴小说文本后点击“开始转换”'
  );
  const [chapterCount, setChapterCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasKey = Boolean(API_KEY && API_KEY !== 'your_deepseek_api_key_here');

  const handleConvert = useCallback(async () => {
    if (!hasKey || !API_KEY) return;
    setError('');
    setLoading(true);
    setOutput('# 转换中，请稍候...');
    const result = await convertNovel(input, chapterCount, API_KEY);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setOutput('# 转换失败');
    } else {
      setOutput(result.yaml);
    }
  }, [input, chapterCount, hasKey, API_KEY]);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
        <h1 className="text-xl font-bold tracking-tight">
          AI 小说转剧本工具
        </h1>
        <span className="text-sm text-gray-500">v0.2.0</span>
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
              onChange={(e) => setChapterCount(Number(e.target.value))}
              className="ml-2 w-16 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-200 text-sm"
            />
          </label>
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