import { useState } from "react";
import type { AppSettings } from "../lib/settings";
import { DEFAULT_SETTINGS } from "../lib/settings";

interface Props {
  open: boolean;
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
  isDark: boolean;
}

export default function SettingsDialog({ open, settings, onSave, onClose, isDark }: Props) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState(false);

  if (!open) return null;

  const overlay = isDark ? "bg-black/50" : "bg-black/30";
  const card = isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const text = isDark ? "text-gray-200" : "text-gray-800";
  const sub = isDark ? "text-gray-400" : "text-gray-500";
  const inputCls = isDark
    ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400";
  const labelCls = isDark ? "text-gray-300" : "text-gray-700";
  const btnPrimary = "bg-blue-600 text-white hover:bg-blue-500";
  const btnMuted = isDark
    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";

  const update = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const updateModel = (
    slot: keyof AppSettings["models"],
    field: "model" | "maxTokens",
    val: string | number
  ) =>
    setDraft((d) => ({
      ...d,
      models: { ...d.models, [slot]: { ...d.models[slot], [field]: val } },
    }));

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleReset = () => setDraft({ ...DEFAULT_SETTINGS, apiKey: "" });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlay} backdrop-blur-sm`}
      onClick={onClose}
    >
      <div
        className={`w-[420px] max-h-[85vh] overflow-y-auto rounded-xl border shadow-2xl p-6 ${card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-sm font-semibold mb-5 ${text}`}>
          设置
        </h2>

        {/* Base URL */}
        <div className="mb-4">
          <label className={`block text-xs font-medium mb-1 ${labelCls}`}>Base URL</label>
          <input
            type="text"
            value={draft.baseUrl}
            onChange={(e) => update("baseUrl", e.target.value)}
            placeholder={DEFAULT_SETTINGS.baseUrl}
            className={`w-full px-3 py-1.5 text-xs rounded border outline-none focus:ring-1 focus:ring-blue-500 ${inputCls}`}
          />
        </div>

        {/* API Key */}
        <div className="mb-5">
          <label className={`block text-xs font-medium mb-1 ${labelCls}`}>API {"\u5bc6\u94a5"}</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={draft.apiKey}
              onChange={(e) => update("apiKey", e.target.value)}
              placeholder="sk-..."
              className={`w-full px-3 py-1.5 pr-8 text-xs rounded border outline-none focus:ring-1 focus:ring-blue-500 ${inputCls}`}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-0.5 py-0.5 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              title={showKey ? "隐藏" : "显示"}
              tabIndex={-1}
            >
              {showKey ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/>
                  <circle cx='12' cy='12' r='3'/>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'/>
                  <line x1='1' y1='1' x2='23' y2='23'/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={`border-t mb-4 ${isDark ? "border-gray-700" : "border-gray-200"}`} />

        {/* Model settings */}
        <h3 className={`text-xs font-semibold mb-3 ${sub}`}>
          {"\u5206\u6b65\u6a21\u5f0f" + " (\u5206\u6b65\u6a21\u5f0f)"}
        </h3>
        {modelRow(
          "\u7b2c1\u6b65(\u89d2\u8272)", "pipelineStep1", draft, updateModel, inputCls, labelCls, isDark
        )}
        {modelRow(
          "\u7b2c2\u6b65(\u573a\u666f)", "pipelineStep2", draft, updateModel, inputCls, labelCls, isDark
        )}
        {modelRow(
          "\u7b2c3\u6b65(\u751f\u6210)", "pipelineStep3", draft, updateModel, inputCls, labelCls, isDark
        )}

        <div className={`border-t my-4 ${isDark ? "border-gray-700" : "border-gray-200"}`} />

        {modelRow(
          "\u975e\u5206\u6b65\u6a21\u5f0f", "singleShot", draft, updateModel, inputCls, labelCls, isDark
        )}
        {modelRow(
          "LUI \u4fee\u6539", "refine", draft, updateModel, inputCls, labelCls, isDark
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-5">
          <button
            onClick={handleReset}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${btnMuted}`}
          >
            {"\u6062\u590d\u9ed8\u8ba4"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-1.5 text-xs rounded-lg border transition-colors ${btnMuted}`}
            >
              {"\u53d6\u6d88"}
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-1.5 text-xs rounded-lg transition-colors ${btnPrimary}`}
            >
              {"\u4fdd\u5b58"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function modelRow(
  label: string,
  slot: keyof AppSettings["models"],
  draft: AppSettings,
  updateModel: (slot: keyof AppSettings["models"], field: "model" | "maxTokens", val: string | number) => void,
  inputCls: string,
  labelCls: string,
  isDark: boolean
) {
  return (
    <div className="mb-3">
      <label className={`block text-xs mb-1 ${labelCls}`}>{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft.models[slot].model}
          onChange={(e) => updateModel(slot, "model", e.target.value)}
          placeholder={DEFAULT_SETTINGS.models[slot].model}
          className={`flex-1 px-2.5 py-1.5 text-xs rounded border outline-none focus:ring-1 focus:ring-blue-500 ${inputCls}`}
        />
        <div className="relative w-30">
          <input
            type="number"
            value={draft.models[slot].maxTokens}
            onChange={(e) => updateModel(slot, "maxTokens", Math.max(1, Number(e.target.value)))}
            className={`w-full px-2 py-1.5 pr-9 text-xs rounded border outline-none focus:ring-1 focus:ring-blue-500 ${inputCls}`}
            title="max_tokens: 单次最大输出 token 数"
          />
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${isDark ? "text-gray-500" : "text-gray-400"}`}>tokens</span>
        </div>
      </div>
    </div>
  );
}
