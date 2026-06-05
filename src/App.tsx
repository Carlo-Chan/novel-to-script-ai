function App() {
  return (
    <div className="flex flex-col h-screen">
      {/* 顶部导航 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <h1 className="text-xl font-bold tracking-tight">
          📝 AI 小说转剧本工具
        </h1>
        <span className="text-sm text-gray-500">v0.1.0</span>
      </header>

      {/* 主内容区：两栏布局 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 左侧：输入区 */}
        <section className="w-1/2 flex flex-col border-r border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              小说原文
            </h2>
          </div>
          <textarea
            className="flex-1 p-4 bg-gray-900 text-gray-200 resize-none outline-none placeholder-gray-600 text-sm leading-relaxed font-mono"
            placeholder="在此粘贴小说章节内容（支持 3 个章节以上）..."
          />
        </section>

        {/* 右侧：输出区 */}
        <section className="w-1/2 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
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
          <pre className="flex-1 p-4 bg-gray-900 text-green-400 overflow-auto text-sm leading-relaxed font-mono">
{`# 剧本将在此处生成...

# 点击下方按钮开始转换`}
          </pre>
        </section>
      </main>

      {/* 底部操作栏 */}
      <footer className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">
            章节数：
            <input
              type="number"
              min={3}
              defaultValue={3}
              className="ml-2 w-16 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-200 text-sm"
            />
          </label>
          <span className="text-xs text-gray-600">API: DeepSeek</span>
        </div>
        <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          开始转换
        </button>
      </footer>
    </div>
  );
}

export default App;
