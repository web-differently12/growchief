import { object, string } from 'zod';
import { llm } from '@growchief/shared-backend/plugs/ai/llm';

export const extractWebsiteAi = async (text: string) => {
  const outPut = object({
    extractedText: string(),
  });

  const modelWithStructure = llm.withStructuredOutput(outPut);
  const structuredOutput = await modelWithStructure.invoke(`
You are an assistant that takes a full website text including and extract only the content.
 
 text:
 ${text}
 `);

  return structuredOutput.extractedText;
};
