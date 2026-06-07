import { useState, useCallback, useEffect, useRef } from 'react';
import { convertNovel } from './lib/deepseek';
import { runPipeline, type PipelineProgress } from './pipeline';
import { refineScript } from './lib/refine';
import { useTheme } from './hooks/useTheme';
import { useHistory } from './hooks/useHistory';
import HistoryPanel from './components/HistoryPanel';
import ConfirmDialog from './components/ConfirmDialog';
import iconLight from './assets/light.png';
import iconDark from './assets/dark.png';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;

function App() {
  const { theme, toggleTheme } = useTheme();
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
  const [refineInput, setRefineInput] = useState('');
  const [refining, setRefining] = useState(false);
  const [editing, setEditing] = useState(false);
  const [preEditOutput, setPreEditOutput] = useState('');
  const { history, pushHistory, handleDeleteHistory, showHistory, setShowHistory } = useHistory();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const inputRef = useRef(input);
  inputRef.current = input;
  const outputRef = useRef(output);
  outputRef.current = output;
  const refineInputRef = useRef(refineInput);
  refineInputRef.current = refineInput;
  

  const wordCount = input.trim().length;
  const hasKey = Boolean(API_KEY && API_KEY !== 'your_deepseek_api_key_here');


  const handleConvert = useCallback(async () => {
    if (!hasKey || !API_KEY) return;
    setError('');
    setLoading(true);
    setProgress(null);
    setFlash(false);
    if (outputRef.current && !outputRef.current.startsWith('#')) {
      pushHistory(outputRef.current);
    }

    try {
      if (usePipeline) {
        const result = await runPipeline(
          inputRef.current, chapterCount, API_KEY,
          (p) => setProgress(p)
        );
        setOutput(result);
        pushHistory(result);
      } else {
        setOutput('# 转换中，请稍候...');
        const result = await convertNovel(inputRef.current, chapterCount, API_KEY);
        if (result.error) {
          setError(result.error);
          setOutput('# 转换失败');
        } else {
          setOutput(result.yaml);
          pushHistory(result.yaml);
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
  }, [chapterCount, hasKey, API_KEY, usePipeline]);

  const handleRefine = useCallback(async () => {
    if (!hasKey || !API_KEY || !refineInputRef.current.trim()) return;
    if (outputRef.current && !outputRef.current.startsWith('#')) {
      pushHistory(outputRef.current);
    }
    setRefining(true);
    setError('');
    try {
      const result = await refineScript(outputRef.current, refineInputRef.current, API_KEY);
      setOutput(result);
      pushHistory(result);
      setRefineInput('');
      setFlash(true);
      setTimeout(() => setFlash(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setRefining(false);
    }
  }, [hasKey, API_KEY]);

  const handleConvertRef = useRef(handleConvert);
  handleConvertRef.current = handleConvert;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConvertRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const resetInput = () => setInput('');
  const resetOutput = () => setOutput('# 剧本将在此处生成...\n\n# 粘贴小说文本后点击“开始转换”');

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  }, [output]);

  const handleSaveEdit = useCallback(() => {
    setEditing(false);
    if (outputRef.current && !outputRef.current.startsWith('#')) {
      pushHistory(outputRef.current);
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  }, [output]);

  const handleCancelEdit = useCallback(() => {
    setOutput(preEditOutput);
    setEditing(false);
  }, [preEditOutput]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screenplay.yaml';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);



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
          <img src={isDark ? iconDark : iconLight} alt='logo' className='w-10 h-10' />
          <h1 className='text-lg font-bold tracking-tight'>AI 小说转剧本工具</h1>
        </div>
        <div className='flex items-center gap-3'>
          <span className={`text-xs ${subText}`}>v1.0.0</span>
          <button
            onClick={toggleTheme}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${pipeOff}`}
            title={isDark ? '切换亮色主题' : '切换暗色主题'}
          >
            {!isDark ? (
              <svg className='w-5 h-5' fill='none' stroke='#f59e0b' strokeWidth={2} viewBox='0 0 24 24'>
                <circle cx={12} cy={12} r={5}/>
                <path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'/>
              </svg>
            ) : (
              <svg className='w-5 h-5' fill='none' stroke='#a78bfa' strokeWidth={2} viewBox='0 0 24 24'>
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

        <section className={`flex-1 flex flex-col md:w-1/2 relative overflow-hidden ${flash ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}>
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
              <button
                onClick={() => { if (editing) { handleSaveEdit(); } else { setPreEditOutput(output); setEditing(true); } }}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${editing ? 'bg-green-600 text-white hover:bg-green-500' : btnMuted}`}
              >
                {editing ? '保存' : '编辑'}
              </button>
              <button onClick={editing ? handleCancelEdit : resetOutput} className={`px-2.5 py-1 text-xs rounded transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 ${btnMuted}`} title='清空输出'>
                {editing ? '取消' : '清除'}
              </button>

            </div>
          </div>

          {(loading || refining) && (
            <div className={`px-4 py-2 border-b ${progressBg}`}>
              {progress ? (
                <>
                  <div className='flex items-center justify-between text-xs mb-1'>
                    <span className={subText}>
                      {String.fromCharCode(27493)}骤 {progress.step}/{progress.total}: {progress.label}
                    </span>
                    <span className={subText}>{Math.round(((progress.step - 1) / progress.total) * 100)}%</span>
                  </div>
                  <div className={`w-full rounded-full h-1.5 ${progressTrack}`}>
                    <div
                      className='bg-blue-500 h-1.5 rounded-full transition-all duration-500'
                      style={{ width: `${((progress.step - 1) / progress.total) * 100}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className='flex items-center justify-between text-xs mb-1'>
                    <span className={subText}>
                      {refining ? 'AI 正在修改剧本...' : 'AI 正在转换剧本...'}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-1.5 overflow-hidden ${progressTrack}`}>
                    <div
                      className='bg-blue-500 h-1.5 rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]'
                      style={{ width: '40%' }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <HistoryPanel
            history={history}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            setOutput={setOutput}
            handleDeleteHistory={(v) => setDeleteTarget(v)}
            isDark={isDark}
            hdrBg={hdrBg}
            subText={subText}
          />
          {editing ? (
            <textarea
              className={`flex-1 p-4 resize-none outline-none text-sm leading-relaxed font-mono ${outputBg}`}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
            />
          ) : (
            <pre
            className={`flex-1 p-4 overflow-auto text-sm leading-relaxed font-mono whitespace-pre-wrap ${outputBg}`}
            >{output}</pre>
          )}
          {(true) && (
            <div className={`flex items-center gap-2 px-3 py-2 border-t shrink-0 ${hdrBg}`}>
              <input
                type='text'
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                placeholder={output && !output.startsWith('#') ? '输入修改指令，如：“把第3场的气氛改温馨”' : '转换完成后可输入修改指令'}
                className={`flex-1 px-3 py-1.5 text-xs rounded border outline-none ${inputBg}`}
                disabled={!output || output.startsWith('#') || refining}
              />
              <button
                onClick={handleRefine}
                disabled={!output || output.startsWith('#') || refining || !refineInput.trim()}
                className='px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors shrink-0'
              >
                {refining ? '生成中...' : '发送'}
              </button>
            </div>
          )}
        </section>
      </main>

      {deleteTarget !== null && (
        <ConfirmDialog
          open={true}
          title="确认删除"
          message={`确定要删除 Version ${deleteTarget} 吗？此操作不可撤销。`}
          onConfirm={() => { handleDeleteHistory(deleteTarget); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
          isDark={isDark}
        />
      )}
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
              <svg className='w-2.5 h-2.5' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                <path strokeLinecap='round' d='M5 12h14'/>
              </svg>
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
            title="分步模式：分三步处理（提取角色 → 分析场景 → 生成剧本），质量更高但速度较慢"
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${usePipeline ? pipeOn : pipeOff}`}
          >
            {usePipeline ? '分步模式: ON' : '分步模式: OFF'}
          </button>

          {!hasKey && (
            <span className='text-xs text-yellow-600'>
              <svg className='w-3.5 h-3.5 inline-block mr-0.5 -mt-0.5' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'>
                <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01'/>
              </svg> 请将 .env.example 复制为 .env 并填入 DeepSeek API Key
            </span>
          )}
          {wordCount > 0 && wordCount < 500 && (
            <span className='text-xs text-yellow-600'>
              <svg className='w-3.5 h-3.5 inline-block mr-0.5 -mt-0.5' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'>
                <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01'/>
              </svg> 文本较短（{wordCount}字），建议至少 500 字
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