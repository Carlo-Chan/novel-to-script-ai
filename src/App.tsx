import { useState, useCallback, useEffect } from 'react';
import { convertNovel } from './lib/deepseek';
import { runPipeline, type PipelineProgress } from './pipeline';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;

const getTheme = (): 'light' | 'dark' => {
  try {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  } catch {
    return 'light';
  }
};

const saveTheme = (t: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', t === 'dark');
  try { localStorage.setItem('theme', t); } catch { /* */ }
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getTheme);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(`# 剧本将在此处生成...

# 粘贴小说文本后点击“开始转换”`);
  const [chapterCount, setChapterCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [usePipeline, setUsePipeline] = useState(true);
  const [progress, setProgress] = useState<PipelineProgress | null>(null);
  const [flash, setFlash] = useState(false);

  const wordCount = input.trim().length;
  const hasKey = Boolean(API_KEY && API_KEY !== 'your_deepseek_api_key_here');

  useEffect(() => { saveTheme(theme); }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const handleConvert = useCallback(async () => {
    if (!hasKey || !API_KEY) return;
    setError('');
    setLoading(true);
    setProgress(null);
    setFlash(false);

    try {
      if (usePipeline) {
        const result = await runPipeline(
          input, chapterCount, API_KEY,
          (p) => setProgress(p)
        );
        setOutput(result);
      } else {
        setOutput('# 转换中，请稍候...');
        const result = await convertNovel(input, chapterCount, API_KEY);
        if (result.error) {
          setError(result.error);
          setOutput('# 转换失败');
        } else {
          setOutput(result.yaml);
        }
      }
      setFlash(true);
      setTimeout(() => setFlash(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      setOutput('# 转换失败');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [input, chapterCount, hasKey, API_KEY, usePipeline]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConvert();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleConvert]);

  const resetInput = () => setInput('');
  const resetOutput = () => setOutput('# 剧本将在此处生成...\n\n# 粘贴小说文本后点击“开始转换”');

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screenplay.yaml';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);


const highlightYaml = (yaml: string): string => {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return yaml.split('\n').map((rawLine) => {
    const line = escapeHtml(rawLine);

    // Full-line comment or section separator
    if (/^\s*#/.test(line) || /^---\s*$/.test(line) || /^\.\.\.\s*$/.test(line))
      return '<span class="text-gray-400 dark:text-gray-500 italic">' + line + '</span>';

    // Key-value pair
    const kv = line.match(/^(\s*)([\w-]+)(:)(\s*)(.*)/);
    if (kv) {
      const indent = kv[1] || '';
      const key = kv[2];
      const colon = kv[3];
      const space = kv[4] || '';
      let val = kv[5] || '';

      let valClass = '';
      if (/^["'].*["']$/.test(val.trim()) || val.trim().includes('#')) valClass = 'text-green-600 dark:text-green-400';
      else if (/^-?\d+(\.\d+)?$/.test(val.trim())) valClass = 'text-amber-600 dark:text-amber-400';
      else if (/^(true|false|yes|no|null|~)$/i.test(val.trim())) valClass = 'text-purple-600 dark:text-purple-400';
      else valClass = 'text-emerald-600 dark:text-emerald-400';

      return indent + '<span class="text-blue-600 dark:text-blue-400 font-semibold">' + key + '</span><span>' + colon + space + '</span><span class="' + valClass + '">' + val + '</span>';
    }

    // List item marker
    if (/^\s*-\s/.test(line)) {
      return line.replace(/^(\s*-)/, '<span class="text-amber-600 dark:text-amber-400">$1</span>');
    }

    return line;
  }).join('\n');
};

  const isDark = theme === 'dark';
  const hdrBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const sectBg = isDark ? 'bg-gray-900' : 'bg-white';
  const inputBg = isDark ? 'bg-gray-900 text-gray-200 placeholder-gray-600' : 'bg-gray-50 text-gray-900 placeholder-gray-400';
  const outputBg = isDark ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-green-700';
  const footerBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const btnMuted = isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  const pageBg = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const pageText = isDark ? 'text-gray-100' : 'text-gray-900';
  const labelText = isDark ? 'text-gray-500' : 'text-gray-500';
  const subText = isDark ? 'text-gray-400' : 'text-gray-500';
  const pipeOn = isDark ? 'bg-blue-900 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300';
  const pipeOff = isDark ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-300';
  const numInput = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-900';
  const progressBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100';
  const progressTrack = isDark ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <div className={`flex flex-col h-screen ${pageBg} ${pageText}`}>
      <header className={`flex items-center justify-between px-6 py-3 border-b shrink-0 min-h-[48px] ${hdrBg}`}>
        <div className='flex items-center gap-3'>
          <span className='text-lg'>{String.fromCodePoint(0x1F3AC)}</span>
          <h1 className='text-lg font-bold tracking-tight'>AI 小说转剧本工具</h1>
        </div>
        <div className='flex items-center gap-3'>
          <span className={`text-xs ${subText}`}>v0.4.0</span>
          <button
            onClick={toggleTheme}
            className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors ${pipeOff}`}
            title={isDark ? '切换亮色主题' : '切换暗色主题'}
          >
            {!isDark ? (
              <svg className='w-4 h-4' fill='none' stroke='#f59e0b' strokeWidth={2} viewBox='0 0 24 24'>
                <circle cx={12} cy={12} r={5}/>
                <path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'/>
              </svg>
            ) : (
              <svg className='w-4 h-4' fill='none' stroke='#a78bfa' strokeWidth={2} viewBox='0 0 24 24'>
                <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'/>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className='flex-1 flex flex-col md:flex-row overflow-hidden'>
        <section className={`flex-1 flex flex-col md:w-1/2 border-r ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 h-[41px] ${hdrBg}`}>
            <h2 className={`text-xs font-semibold uppercase tracking-wide ${subText}`}>
              小说原文
            </h2>
            <div className='flex items-center gap-2'>
              <span className={`text-xs font-mono ${wordCount < 500 && wordCount > 0 ? 'text-yellow-600' : subText}`}>
                {wordCount} 字
              </span>
              {input && (
                <button onClick={resetInput} className={`text-xs px-1.5 py-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 ${subText}`} title='清空输入'>
                  ✕
                </button>
              )}
            </div>
          </div>
          <textarea
            className={`flex-1 p-4 resize-none outline-none text-sm leading-relaxed font-mono ${inputBg}`}
            placeholder='在此粘贴小说章节内容（支持 3 个章节以上）...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </section>

        <section className={`flex-1 flex flex-col md:w-1/2 ${flash ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}>
          <div className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 h-[41px] ${hdrBg}`}>
            <h2 className={`text-xs font-semibold uppercase tracking-wide ${subText}`}>
              剧本输出（YAML）
            </h2>
            <div className='flex gap-1.5'>
              <button onClick={handleCopy} className={`px-2.5 py-1 text-xs rounded transition-colors ${btnMuted}`}>
                {copied ? '已复制' : '复制'}
              </button>
              <button onClick={handleDownload} className={`px-2.5 py-1 text-xs rounded transition-colors ${btnMuted}`}>
                下载
              </button>
              <button onClick={resetOutput} className={`px-2 py-1 text-xs rounded transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 ${btnMuted}`} title='清空输出'>
                清除
              </button>
            </div>
          </div>

          {progress && (
            <div className={`px-4 py-2 border-b ${progressBg}`}>
              <div className='flex items-center justify-between text-xs mb-1'>
                <span className={subText}>
                  步骤 {progress.step}/{progress.total}: {progress.label}
                </span>
                <span className={subText}>{Math.round(((progress.step - 1) / progress.total) * 100)}%</span>
              </div>
              <div className={`w-full rounded-full h-1.5 ${progressTrack}`}>
                <div
                  className='bg-blue-500 h-1.5 rounded-full transition-all duration-500 animate-pulse'
                  style={{ width: `${((progress.step - 1) / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <pre
            className={`flex-1 p-4 overflow-auto text-sm leading-relaxed font-mono whitespace-pre-wrap ${outputBg}`}
            dangerouslySetInnerHTML={{ __html: highlightYaml(output) }}
          />
        </section>
      </main>

      <footer className={`flex items-center justify-between px-6 py-3 border-t shrink-0 flex-wrap gap-2 ${footerBg}`}>
        <div className='flex items-center gap-3 flex-wrap'>
          <label className={`text-xs ${labelText}`}>
            章节数：
          </label>
          <div className='flex items-center'>
            <button
              onClick={() => setChapterCount(c => Math.max(3, c - 1))}
              className={`px-1.5 py-0.5 text-xs rounded-l border border-r-0 transition-colors ${numInput}`}
            >
              −
            </button>
            <span className={`px-2 py-0.5 text-xs border-y text-center w-10 select-none ${numInput}`}>
              {chapterCount}
            </span>
            <button
              onClick={() => setChapterCount(c => c + 1)}
              className={`px-1.5 py-0.5 text-xs rounded-r border border-l-0 transition-colors ${numInput}`}
            >
              +
            </button>
          </div>

          <button
            onClick={() => setUsePipeline(!usePipeline)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${usePipeline ? pipeOn : pipeOff}`}
          >
            {usePipeline ? 'Pipeline: ON' : 'Pipeline: OFF'}
          </button>

          {!hasKey && (
            <span className='text-xs text-yellow-600'>
              ⚠ 请将 .env.example 复制为 .env 并填入 DeepSeek API Key
            </span>
          )}
          {wordCount > 0 && wordCount < 500 && (
            <span className='text-xs text-yellow-600'>
              ⚠ 文本较短（{wordCount}字），建议至少 500 字
            </span>
          )}
          {error && (
            <span className='text-xs text-red-500'>{error}</span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <span className={`text-xs ${subText}`}>Ctrl+Enter</span>
          <button
            onClick={handleConvert}
            disabled={!hasKey || loading || !input.trim()}
            className='px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors'
          >
            {loading ? '转换中...' : '开始转换'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;