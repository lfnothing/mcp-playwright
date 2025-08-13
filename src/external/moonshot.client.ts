import OpenAI from "openai";
import { env } from "../config/env.js";

const moonshot_client = new OpenAI({
  baseURL: env.MOONSHOT_BASE_URL,
  apiKey: env.MOONSHOT_API_KEY,
});

export default moonshot_client;
