import { intro, outro, confirm, isCancel, cancel, log } from "@clack/prompts";
import { configExists, configPath, resetConfig } from "../config.js";

export async function runReset() {
  if (!configExists()) {
    log.info("Nothing to reset — ash is not configured yet.");
    return;
  }

  intro("ash reset — clear all configuration");

  const confirmed = await confirm({
    message: `This will delete ${configPath()} (API key, model, target, clipboard setting). Continue?`,
    initialValue: false,
  });
  if (isCancel(confirmed) || !confirmed) {
    cancel("Reset cancelled.");
    return;
  }

  resetConfig();
  outro('Configuration cleared. Run "ash init" to set it up again.');
}
