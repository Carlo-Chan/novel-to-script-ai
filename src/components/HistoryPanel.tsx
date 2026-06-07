import { type HistoryEntry } from "../hooks/useHistory";

interface HistoryPanelProps {
  history: HistoryEntry[];
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  setOutput: (v: string) => void;
  handleDeleteHistory: (v: number) => void;
  isDark: boolean;
  hdrBg: string;
  subText: string;
}

export default function HistoryPanel({
  history,
  showHistory,
  setShowHistory,
  setOutput,
  handleDeleteHistory,
  isDark,
  hdrBg,
  subText,
}: HistoryPanelProps) {
  return (
    <>
      {/* --- 历史记录抽屉面板 --- */}
      <div
        className={`absolute top-0 right-0 h-full z-30 transition-transform duration-300 ease-in-out flex ${
          showHistory ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "320px" }}
      >
        {/* 书签拉环按钮 */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`absolute -left-[23px] top-1/2 -translate-y-1/2 w-6 h-12 flex items-center justify-center rounded-l-full border border-r-0 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] transition-colors cursor-pointer z-40 ${
            isDark
              ? "bg-gray-900 border-gray-700 text-gray-400 hover:text-gray-200"
              : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
          }`}
          title="历史记录"
        >
          {showHistory ? (
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>

        {/* 面板主体内容 */}
        <div
          className={`w-full h-full border-l shadow-2xl flex flex-col ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className={`flex items-center justify-center px-5 py-2.5 border-b shrink-0 h-[41px] ${hdrBg}`}>
            <h2 className={`text-xs font-semibold uppercase tracking-wide ${subText}`}>
              修订历史 ({history.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {history.length === 0 ? (
              <div className={`text-xs text-center mt-10 ${subText}`}>
                暂无历史记录<br /><br />每次成功转换或修改后将自动保存
              </div>
            ) : (
              history.map((entry) => {
                const firstLine = entry.text.split("\n")[0].replace(/^# /, "").slice(0, 35);
                return (
                  <div
                    key={entry.version}
                    onClick={() => { setOutput(entry.text); setShowHistory(false); }}
                    className={`group w-full text-left p-3 pr-8 rounded-lg border transition-all duration-200 cursor-pointer relative ${
                      isDark
                        ? "bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-750"
                        : "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm"
                    } ${subText}`}
                  >
                    <div className="mb-1.5">
                      <span className="font-mono text-xs font-semibold text-blue-500">
                        Version {entry.version}
                      </span>
                    </div>
                    <div className="text-xs truncate text-gray-700 dark:text-gray-300">
                      {firstLine || "(空片段)"}
                    </div>
                    <span
                      onClick={(e) => { e.stopPropagation(); handleDeleteHistory(entry.version); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="删除此记录"
                    >
                      ✕
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {/* --- 历史记录抽屉面板 END --- */}
    </>
  );
}
