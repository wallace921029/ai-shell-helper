import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { defaultTargetId } from "./targets.js";

const CONFIG_DIR = join(homedir(), ".ash");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export function configExists() {
  return existsSync(CONFIG_PATH);
}

export function loadConfig() {
  if (!configExists()) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return null;
  }
}

export function saveConfig(partial) {
  const current = loadConfig() || {};
  const next = {
    baseUrl: current.baseUrl ?? "",
    apiKey: current.apiKey ?? "",
    model: current.model ?? "",
    target: current.target ?? defaultTargetId(),
    clipboard: current.clipboard ?? true,
    ...partial,
  };
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function configPath() {
  return CONFIG_PATH;
}
