import fs from "node:fs";
import path from "node:path";

const { getWallet, getAutomatonDir } = await import("file:///app/dist/identity/wallet.js");
const { createConfig, saveConfig } = await import("file:///app/dist/config.js");
const { writeDefaultHeartbeatConfig } = await import("file:///app/dist/heartbeat/config.js");
const { detectEnvironment } = await import("file:///app/dist/setup/environment.js");
const { generateSoulMd, installDefaultSkills } = await import("file:///app/dist/setup/defaults.js");

const requiredEnv = [
  "AUTOMATON_NAME",
  "AUTOMATON_GENESIS_PROMPT",
  "AUTOMATON_CREATOR_ADDRESS",
];

const missing = requiredEnv.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error(`[docker] Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const chainType = process.env.AUTOMATON_CHAIN_TYPE?.trim() === "solana"
  ? "solana"
  : "evm";

const { chainIdentity } = await getWallet(chainType);
const walletAddress = chainIdentity.address;
const automatonDir = getAutomatonDir();
const environment = detectEnvironment();
const sandboxId = process.env.AUTOMATON_SANDBOX_ID?.trim() || environment.sandboxId;
const apiKey = process.env.CONWAY_API_KEY?.trim() || "";

const config = createConfig({
  name: process.env.AUTOMATON_NAME.trim(),
  genesisPrompt: process.env.AUTOMATON_GENESIS_PROMPT.trim(),
  creatorMessage: process.env.AUTOMATON_CREATOR_MESSAGE?.trim() || undefined,
  creatorAddress: process.env.AUTOMATON_CREATOR_ADDRESS.trim(),
  registeredWithConway: Boolean(apiKey),
  sandboxId,
  walletAddress,
  apiKey,
  openaiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY?.trim() || undefined,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL?.trim() || undefined,
  chainType,
});

saveConfig(config);
writeDefaultHeartbeatConfig();

fs.mkdirSync(automatonDir, { recursive: true, mode: 0o700 });

const constitutionSrc = "/app/constitution.md";
const constitutionDst = path.join(automatonDir, "constitution.md");
if (fs.existsSync(constitutionSrc)) {
  fs.copyFileSync(constitutionSrc, constitutionDst);
  fs.chmodSync(constitutionDst, 0o444);
}

const soulPath = path.join(automatonDir, "SOUL.md");
if (!fs.existsSync(soulPath)) {
  fs.writeFileSync(
    soulPath,
    generateSoulMd(
      config.name,
      walletAddress,
      config.creatorAddress,
      config.genesisPrompt,
    ),
    { mode: 0o600 },
  );
}

installDefaultSkills(config.skillsDir || "~/.automaton/skills");

console.log(`[docker] Bootstrapped automaton "${config.name}" at ${automatonDir}`);
