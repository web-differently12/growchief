import { object, string } from 'zod';
import { llm } from '@growchief/shared-backend/plugs/ai/llm';

export const extractTextAi = async (text: string) => {
  const outPut = object({
    extractedText: string(),
  });

  const modelWithStructure = llm.withStructuredOutput(outPut);
  const structuredOutput = await modelWithStructure.invoke(`
You are an assistant that takes text and extract the content of it because it contains some gibberish and irrelevant stuff
 
 text:
 ${text}
 `);

  return structuredOutput.extractedText;
};
