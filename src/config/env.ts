// envalid schema & 类型推导
import { cleanEnv, str, port, url, bool } from "envalid";

/**
 * dotenv 读取逻辑：先 expand → 再注入 process.env
 * 如果提前调用过，重复调用会被 dotenv 忽略
 */
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
dotenvExpand.expand(dotenv.config({ path: resolveEnvFile() }));

function resolveEnvFile() {
  const env = process.env.NODE_ENV ?? "development";
  return `.env.${env}`;
}

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
  PORT: port({ default: 3000 }),
  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace"],
    default: "info",
  }),
  ENABLE_SWAGGER: bool({ default: false }),
  AMAP_API_BASE_URL: url(),
  AMAP_HTTP_KEY: str(), // 从 .env 注入
  AMAP_HTTP_TIMEOUT: port({ default: 5000 }),
  MOONSHOT_BASE_URL: url(),
  MOONSHOT_API_KEY: str(),
});

/**
 * 导出类型：让 index.ts 拿到完整 IntelliSense
 */
export type Config = Readonly<typeof env>;
