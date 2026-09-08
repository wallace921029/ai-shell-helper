import { log } from "@clack/prompts";
import pc from "picocolors";
import clipboard from "clipboardy";
import { loadConfig } from "../config.js";
import { getTarget } from "../targets.js";
import { askLine } from "../prompt.js";
import { createSpinner } from "../spinner.js";

export async function runDefault() {
  const config = loadConfig();
  if (!config || !config.baseUrl || !config.apiKey || !config.model) {
    log.error('No model configured yet. Run "ash init" first.');
    process.exitCode = 1;
    return;
  }

  const target = getTarget(config.target) || getTarget("powershell");

  const input = await askLine(">>> ");
  if (input === null || !input.trim()) {
    return;
  }

  const s = createSpinner();
  s.start("Handling it, please wait a moment...");

  let command;
  try {
    const { generateCommand } = await import("../ai.js");
    command = await generateCommand({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      target,
      input: input.trim(),
    });
    s.stop("Done.");
  } catch (err) {
    s.stop("Failed.");
    log.error(err.message || String(err));
    process.exitCode = 1;
    return;
  }

  console.log(pc.bold(pc.green(command)));

  if (config.clipboard) {
    try {
      await clipboard.write(command);
      log.message(pc.dim("(copied to clipboard)"));
    } catch {
      // Clipboard access can fail in headless/CI environments — non-fatal.
    }
  }
}
