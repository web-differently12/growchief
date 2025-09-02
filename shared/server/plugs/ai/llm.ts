import { ChatOpenAI as AnyLLM } from '@langchain/openai';

export const llm = new AnyLLM({
  apiKey: process.env.OPENAI_KEY,
  model: 'gpt-4.1',
});

export const visionLLM = new AnyLLM({
  apiKey: process.env.OPENAI_KEY,
  model: 'gpt-4.1-mini',
});
