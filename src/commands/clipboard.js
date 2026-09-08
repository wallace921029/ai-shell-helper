import { intro, outro, select, isCancel, cancel, log } from "@clack/prompts";
import { loadConfig, saveConfig } from "../config.js";

export async function runClipboard(arg) {
  const current = loadConfig();
  const currentlyOn = current?.clipboard ?? true;

  if (arg === "on" || arg === "off") {
    saveConfig({ clipboard: arg === "on" });
    log.success(`Auto-copy to clipboard: ${arg}`);
    return;
  }

  intro("ash clipboard — auto-copy generated commands to the clipboard");

  const choice = await select({
    message: "Auto-copy generated commands to the clipboard?",
    initialValue: currentlyOn,
    options: [
      { value: true, label: "On", hint: currentlyOn ? "current" : undefined },
      { value: false, label: "Off", hint: !currentlyOn ? "current" : undefined },
    ],
  });
  if (isCancel(choice)) return cancel("Clipboard setting unchanged.");

  saveConfig({ clipboard: choice });
  outro(`Auto-copy to clipboard: ${choice ? "on" : "off"}`);
}
