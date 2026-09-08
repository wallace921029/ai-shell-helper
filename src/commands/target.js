import { intro, outro, select, isCancel, cancel } from "@clack/prompts";
import { TARGETS, defaultTargetId } from "../targets.js";
import { loadConfig, saveConfig } from "../config.js";

export async function runTarget() {
  intro("ash target — choose the shell ash should generate commands for");

  const current = loadConfig();
  const currentId = current?.target || defaultTargetId();

  const choice = await select({
    message: "Target shell",
    initialValue: currentId,
    options: TARGETS.map((t) => ({
      value: t.id,
      label: t.label,
      hint: t.id === currentId ? "current" : undefined,
    })),
  });
  if (isCancel(choice)) return cancel("Target unchanged.");

  saveConfig({ target: choice });

  const target = TARGETS.find((t) => t.id === choice);
  outro(`Target shell set to: ${target.label}`);
}
