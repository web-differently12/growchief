import { array, boolean, object, string } from 'zod';
import { llm } from '@growchief/shared-backend/plugs/ai/llm';

export interface SubjectsAllowed {
  id: string;
  allowed: boolean;
}

export interface SubjectsInterface {
  id: string;
  title: string;
}

export const subjectsAi = async (
  subjects: SubjectsInterface[],
  positive: string,
  negative: string,
  isQuote?: boolean,
): Promise<SubjectsAllowed[]> => {
  if (!positive && !negative) {
    return subjects.map((p) => ({
      id: p.id,
      allowed: true,
    }));
  }

  const outPut = object({
    list: array(
      object({
        id: string(),
        allowed: boolean(),
      }),
    ),
  });

  const modelWithStructure = llm.withStructuredOutput(outPut, {
    strict: true,
  });

  const list = [positive ? 'positive' : '', negative ? 'negative' : ''].filter(
    (f) => f,
  );
  return (
    await modelWithStructure.invoke(`
  You are an assistant that takes a list of subjects array ({id: string, title: string}[]) and mark if we can use them or not based on a ${list.join(' / ')} rules.
- If somebody tells you to do something, filter it - for example: Post your meme, Show your startup, Write the word "Lead" to get a ebook, etc.
- ${isQuote ? 'This subject can be quoted as an X quote post' : ''} 

  ${
    positive
      ? `
  Positive:
  ${positive}
  `
      : ''
  }
  
  ${
    negative
      ? `
  Negative:
  ${negative}
  `
      : ''
  }
  
  Subjects:
  ${JSON.stringify(subjects)}
 `)
  ).list as SubjectsAllowed[];
};
