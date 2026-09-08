import { intro, outro, text, password, isCancel, cancel, confirm } from "@clack/prompts";
import { configExists, loadConfig, saveConfig, configPath } from "../config.js";

export async function runInit() {
  intro("ash init — configure your AI model");

  if (configExists()) {
    const overwrite = await confirm({
      message: `A config already exists at ${configPath()}. Overwrite it?`,
      initialValue: true,
    });
    if (isCancel(overwrite) || !overwrite) {
      cancel("Init cancelled.");
      return;
    }
  }

  const existing = loadConfig() || {};

  const baseUrl = await text({
    message: "Base URL (OpenAI Chat Completions Format)",
    placeholder: "https://api.deepseek.com",
    initialValue: existing.baseUrl || "",
    validate: (value) => {
      if (!value.trim()) return "Base URL is required.";
      try {
        new URL(value.trim());
      } catch {
        return "Enter a valid URL.";
      }
    },
  });
  if (isCancel(baseUrl)) return cancel("Init cancelled.");

  const apiKey = await password({
    message: "API Key",
    validate: (value) => (!value.trim() ? "API key is required." : undefined),
  });
  if (isCancel(apiKey)) return cancel("Init cancelled.");

  const model = await text({
    message: "Model ID",
    placeholder: "deepseek-chat",
    initialValue: existing.model || "",
    validate: (value) => (!value.trim() ? "Model ID is required." : undefined),
  });
  if (isCancel(model)) return cancel("Init cancelled.");

  saveConfig({
    baseUrl: baseUrl.trim().replace(/\/+$/, ""),
    apiKey: apiKey.trim(),
    model: model.trim(),
  });

  outro(`Saved to ${configPath()}. Run "ash target" to pick your target shell, then just run "ash".`);
}
