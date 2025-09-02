import { object, string } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Locator } from 'patchright';
import { visionLLM } from '@growchief/shared-backend/plugs/ai/llm';

export const pictureToText = async (locator: Locator | string) => {
  try {
    const base64image =
      typeof locator === 'string'
        ? locator
        : await locator.screenshot({
            type: 'jpeg',
            quality: 30,
          });

    const outPut = object({
      post: string(),
    });

    // 2. Create prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        [
          {
            type: 'input_text',
            text: 'You are an assistant that takes a image from social media and convert it to a social post that could be describe without any attachments',
          },
        ],
      ],
      [
        'user',
        [
          {
            type: 'input_image',
            image_url: {
              url: `data:image/jpeg;base64,${base64image.toString('base64')}`,
            },
          },
        ],
      ],
    ]);

    const model = visionLLM.withStructuredOutput(outPut);

    // 4. Chain prompt → model
    const chain = prompt.pipe(model);

    // 5. Call the chain
    const result = await chain.invoke({});

    return result.post;
  } catch (err) {
    return '';
  }
};
