export interface AppSettings {
  baseUrl: string;
  apiKey: string;
  models: {
    pipelineStep1: { model: string; maxTokens: number };
    pipelineStep2: { model: string; maxTokens: number };
    pipelineStep3: { model: string; maxTokens: number };
    singleShot:   { model: string; maxTokens: number };
    refine:       { model: string; maxTokens: number };
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  baseUrl: "https://api.deepseek.com",
  apiKey: "",
  models: {
    pipelineStep1: { model: "deepseek-v4-flash", maxTokens: 4096 },
    pipelineStep2: { model: "deepseek-v4-flash", maxTokens: 4096 },
    pipelineStep3: { model: "deepseek-v4-pro",   maxTokens: 16384 },
    singleShot:   { model: "deepseek-v4-pro",    maxTokens: 16384 },
    refine:       { model: "deepseek-v4-pro",    maxTokens: 16384 },
  },
};

export function buildApiUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/chat/completions")) return trimmed;
  if (trimmed.endsWith("/v1")) return trimmed + "/chat/completions";
  return trimmed + "/v1/chat/completions";
}

const STORAGE_KEY = "app-settings";

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, apiKey: "" };
    const data = JSON.parse(raw);
    return {
      baseUrl: typeof data.baseUrl === "string" ? data.baseUrl : DEFAULT_SETTINGS.baseUrl,
      apiKey: typeof data.apiKey === "string" ? data.apiKey : "",
      models: {
        pipelineStep1: {
          model: data.models?.pipelineStep1?.model || DEFAULT_SETTINGS.models.pipelineStep1.model,
          maxTokens: typeof data.models?.pipelineStep1?.maxTokens === "number" ? data.models.pipelineStep1.maxTokens : DEFAULT_SETTINGS.models.pipelineStep1.maxTokens,
        },
        pipelineStep2: {
          model: data.models?.pipelineStep2?.model || DEFAULT_SETTINGS.models.pipelineStep2.model,
          maxTokens: typeof data.models?.pipelineStep2?.maxTokens === "number" ? data.models.pipelineStep2.maxTokens : DEFAULT_SETTINGS.models.pipelineStep2.maxTokens,
        },
        pipelineStep3: {
          model: data.models?.pipelineStep3?.model || DEFAULT_SETTINGS.models.pipelineStep3.model,
          maxTokens: typeof data.models?.pipelineStep3?.maxTokens === "number" ? data.models.pipelineStep3.maxTokens : DEFAULT_SETTINGS.models.pipelineStep3.maxTokens,
        },
        singleShot: {
          model: data.models?.singleShot?.model || DEFAULT_SETTINGS.models.singleShot.model,
          maxTokens: typeof data.models?.singleShot?.maxTokens === "number" ? data.models.singleShot.maxTokens : DEFAULT_SETTINGS.models.singleShot.maxTokens,
        },
        refine: {
          model: data.models?.refine?.model || DEFAULT_SETTINGS.models.refine.model,
          maxTokens: typeof data.models?.refine?.maxTokens === "number" ? data.models.refine.maxTokens : DEFAULT_SETTINGS.models.refine.maxTokens,
        },
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS, apiKey: "" };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* storage full */ }
}
