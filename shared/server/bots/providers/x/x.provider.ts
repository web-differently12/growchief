import {
  ActionList,
  BotAbstract,
  type ParamsValue,
  type RunEnrichment,
  SpecialEvents,
} from '@growchief/shared-backend/bots/bots.interface';
import { Page } from 'patchright';
import { expect } from 'patchright/test';
import { ProgressResponse } from '@growchief/shared-backend/temporal/progress.response';
import { timer } from '@growchief/shared-both/utils/timer';
import { Tool } from '@growchief/shared-both/utils/tool.decorator';
import { extractUserData } from '@growchief/shared-backend/bots/providers/x/extract.person.profile';
import { compareTwoStrings } from 'string-similarity';
import { Plug } from '@growchief/shared-backend/plugs/plug.decorator';
import { generateComment } from '@growchief/shared-backend/plugs/ai/comment.ai';
import { shuffle, uniqBy } from 'lodash';
import { pictureToText } from '@growchief/shared-backend/plugs/ai/picture.to.text';
import { HumanTypingOptions } from '@growchief/shared-backend/bots/typing.tool';

export class XProvider extends BotAbstract {
  identifier = 'x';
  label = 'X (Formerly Twitter)';
  initialPage = 'https://x.com';
  disconnectedElement = `//a[contains(@href, "/login")]`;
  delay = 1800000;
  preventLoadingImages = false;
  headful = true;
  urlRegex = /https:\/\/x\.com\/(.*?)/;
  isWWW = false;
  searchURL = undefined;
  order = 2;

  async accountLimited(
    params: ParamsValue,
  ): Promise<Required<ProgressResponse> | false> {
    await timer(100000);
    return false;
  }

  async processLead(params: ParamsValue) {
    const json = await (
      await params.cursor.page.waitForResponse(/UserByScreenName/gm, {
        timeout: 0,
      })
    ).json();

    return extractUserData(json);
  }

  async login(params: {
    page: Page;
    cursor: SpecialEvents;
  }): Promise<{ picture: string; name: string; id: string } | false> {
    const { page, cursor } = params;
    return Promise.race<{ picture: string; name: string; id: string } | false>([
      new Promise(async (res) => {
        try {
          const sideNav = page.locator(
            '[data-testid="SideNav_AccountSwitcher_Button"]',
          );

          await sideNav.waitFor({
            timeout: 0,
          });

          const profile = sideNav.locator('img').first();
          await profile.waitFor({ timeout: 0 });

          const picture = (await profile.getAttribute('src'))!;
          const name = (await profile.getAttribute('alt'))!;
          const idElement = page
            .locator('[data-testid="AppTabBar_Profile_Link"]')
            .first();
          await idElement.waitFor({ timeout: 0 });

          const id = (await idElement.getAttribute('href'))!.split('/').pop()!;

          return res({
            picture,
            name,
            id,
          });
        } catch (err) {
          console.log(err);
          return res(false);
        }
      }),
      new Promise(async (_) => {
        try {
          await page.goto('https://x.com');
          await page.locator(`//a[contains(@href, "/login")]`).waitFor();
          await cursor.click(`//a[contains(@href, "/login")]`);
          await page.locator(`[autocomplete="username"]`).waitFor();
          await expect(page.locator(`[autocomplete="username"]`)).toBeVisible();
          cursor.startMouse();

          await timer(600000);
        } catch (err) {
          console.log(err);
        }
      }),
    ]);
  }

  @Tool({
    priority: 1,
    title: 'Follow Person',
    identifier: 'x-follow-person',
    allowedBeforeIdentifiers: [],
    notAllowedBeforeIdentifiers: ['x-follow-person', 'x-send-message'],
    description: 'Send a connection request',
    notAllowedBeforeIdentifier: ['x-follow-person', 'x-send-message'],
    maxChildren: 1,
    weeklyLimit: 100,
  })
  async followConnection(params: ParamsValue, lead: RunEnrichment) {
    if (lead.degree === 1 || lead.degree === 3) {
      return {
        delay: 0,
        repeatJob: false,
        endWorkflow: true,
      };
    }

    const followButton = params.page
      .getByTestId('primaryColumn')
      .first()
      .getByTestId(/^\d+-follow$/)
      .first();
    await followButton.waitFor({ timeout: 60000, state: 'visible' });
    await timer(5000);
    await params.cursor.click(followButton);
    await followButton.waitFor({ timeout: 60000, state: 'detached' });

    return {
      delay: 0,
      repeatJob: false,
      endWorkflow: true,
    };
  }

  @Tool({
    priority: 2,
    title: 'Send follow up Message',
    identifier: 'x-send-followup-message',
    allowedBeforeIdentifiers: ['x-send-message'],
    notAllowedBeforeIdentifiers: [],
    description: 'Send a message',
    notAllowedBeforeIdentifier: ['x-send-message', 'x-send-followup-message'],
    maxChildren: 1,
  })
  @Tool({
    priority: 3,
    title: 'Send Message',
    identifier: 'x-send-message',
    allowedBeforeIdentifiers: [],
    notAllowedBeforeIdentifiers: ['x-send-followup-message', 'x-send-message'],
    description: 'Send a message',
    notAllowedBeforeIdentifier: ['x-send-message', 'x-follow-person'],
    maxChildren: 1,
  })
  async sendMessage(params: ParamsValue, lead: RunEnrichment) {
    const data = await params.cursor.getData();
    const dm = params.page.getByTestId('sendDMFromProfile').first();
    await params.page
      .getByTestId('placementTracking')
      .first()
      .waitFor({ state: 'visible' });
    try {
      await dm.waitFor({ timeout: 60000, state: 'visible' });
    } catch (err) {
      return {
        delay: 0,
        repeatJob: false,
        endWorkflow: true,
      };
    }
    await timer(5000);
    await params.cursor.click(dm);
    const textarea = params.page.getByTestId('dmComposerTextInput_label');
    await textarea.waitFor({ timeout: 10000, state: 'visible' });

    const messages = params.page.getByTestId('messageEntry');
    try {
      await messages.last().waitFor({
        timeout: 10000,
      });
      const allMessagesContent = await messages.allTextContents();
      if (
        allMessagesContent.some(
          (p) => compareTwoStrings(p, data.message) > 0.95,
        )
      ) {
        return {
          delay: 0,
          repeatJob: false,
          endWorkflow: false,
        };
      }
    } catch (err) {}

    await timer(5000);
    await params.cursor.click(textarea);
    await timer(5000);
    await params.cursor.type(data.message);
    await timer(5000);
    await params.page.keyboard.press('Enter');
    const button = params.page.getByTestId('dmComposerSendButton');
    await expect(button).toBeDisabled();
    await timer(5000);

    return {
      delay: 0,
      repeatJob: false,
      endWorkflow: false,
    };
  }

  @Tool({
    priority: 1,
    title: 'Delay',
    identifier: 'delay',
    allowedBeforeIdentifiers: [],
    notAllowedBeforeIdentifiers: [],
    description: 'Delay the account for a specified time',
    notAllowedBeforeIdentifier: ['delay'],
    maxChildren: 1,
  })
  async delayAccount(params: ParamsValue) {
    return {
      endWorkflow: false,
      delay: this.delay,
      repeatJob: false,
    };
  }

  @Plug({
    priority: 20,
    identifier: 'upvote-and-comment-on-a-post-x',
    description:
      "Using a smart AI approach, we will give likes and craft a great message that don't look like AI",
    title: 'Random likes and comments with AI',
    randomSelectionChance: 1,
    variables: [
      {
        type: 'input',
        title: 'Positive',
        defaultValue: '',
        id: 'positive',
        regex: /.*/,
        placeholder: 'Things account should talk about',
      },
      {
        type: 'input',
        title: 'Negative',
        defaultValue: '',
        id: 'negative',
        regex: /.*/,
        placeholder: 'Things account should not talk about',
      },
      {
        type: 'select',
        title: 'Reply to connections',
        defaultValue: '',
        id: 'connection-type',
        regex: /.*/,
        placeholder: 'Connection type',
        options: [
          {
            value: 'all',
            label: 'All',
          },
          {
            value: 'following-me',
            label: 'Following me',
          },
          {
            value: 'i-follow',
            label: 'I am following',
          },
        ],
      },
      {
        type: 'textarea',
        title: 'System Prompt',
        defaultValue: generateComment(),
        regex: /.*/,
        id: 'system-prompt',
        placeholder: 'Enter the system prompt',
      },
    ],
  })
  async likeAndCommentOnAPost(params: ParamsValue) {
    const { cursor, page } = params;
    const connectionType = params.cursor.getData()['connection-type'];
    const a = await page.waitForResponse((p: any) => {
      return p.url().indexOf('/HomeTimeline') > -1;
    });

    const json = await a.json();

    const tabList = page.locator(`[role="tablist"] > div`);
    await tabList.first().waitFor();
    await timer(5000);
    const article = page.locator(`article`);
    await article.first().waitFor();

    const all = await article.all();
    let i = 0;
    const imgs: {
      num: number;
      internalId: string;
      image: Buffer;
      userUrl: string;
      following: boolean;
      followed_by: boolean;
    }[] = [];
    for (const item of all) {
      await cursor.scrollToElement('article', i);
      const internalId = (
        await item
          .locator('//a[contains(@href, "/status/")]')
          .first()
          .getAttribute('href')
      )
        ?.split('/')
        .slice(-1)[0]!;

      const user =
        'https://x.com/' +
        (
          await item
            .locator('//a[contains(@href, "/status/")]')
            .first()
            .getAttribute('href')
        )?.split('/')[1];

      if (+internalId > 0) {
        const entry =
          json?.data?.home?.home_timeline_urt?.instructions?.[0]?.entries?.find?.(
            (p: any) => p.entryId.indexOf(internalId) > -1,
          );

        const obj = (
          entry?.content?.items?.[0]?.item?.itemContent?.tweet_results ||
          entry?.content?.itemContent?.tweet_results
        )?.result?.core?.user_results?.result?.relationship_perspectives;

        const following = obj?.following;
        const followed_by = obj?.followed_by;

        if (typeof following !== 'undefined') {
          imgs.push({
            following: following || false,
            followed_by: followed_by || false,
            num: i,
            internalId,
            userUrl: user,
            image: await item.screenshot({
              type: 'jpeg',
              quality: 30,
            }),
          });
        }
      }

      i++;
    }

    const images = imgs.filter((p) => {
      if (connectionType === 'all') {
        return true;
      }
      if (connectionType === 'i-follow') {
        return p.following;
      }
      if (connectionType === 'following-me') {
        return p.followed_by;
      }
      return false;
    });

    const list = ['upvote', 'comment'];

    const checkUsed = await cursor.checkUsed(
      images.reduce(
        (all, p) => [
          ...all,
          ...list.map((type) => ({
            id: p.internalId,
            type: type,
            userUrl: p.userUrl,
          })),
        ],
        [],
      ),
    );

    const notFound = checkUsed.filter((f) => !f.found);

    if (!notFound.length) {
      return {
        delay: 0,
        repeatJob: false,
        endWorkflow: true,
      };
    }

    const toFind = uniqBy(notFound, (p) => p.internalId).map((p) =>
      images.find((a) => a.internalId === p.internalId),
    );

    const subjects = await Promise.all(
      toFind.map(async (image) => ({
        id: image?.internalId!,
        title: await pictureToText(image?.image?.toString('base64')!),
      })),
    );

    const allowed = shuffle(
      await cursor.ai.getAllowedSubjects(
        subjects,
        params.cursor.getData().positive,
        params.cursor.getData().negative,
        !!params?.data?.isQuoted,
      ),
    ).filter((p) => p.allowed)?.[0];

    if (!allowed) {
      return {
        delay: 0,
        repeatJob: false,
        endWorkflow: true,
      };
    }

    const upvoteAndLike = notFound
      .filter((p) => p.internalId === allowed.id)
      .map((p) => ({
        num: images?.find?.((i) => i.internalId === p.internalId)!.num,
        id: p.internalId,
        type: p.type,
        text: subjects?.find((i) => i.id === p.internalId)?.title!,
      }));

    await cursor.scrollToElement('[contenteditable="true"]');
    await cursor.scrollToElement('article', upvoteAndLike[0].num);
    const selector = page.locator('article', {
      has: page.locator(
        `//a[contains(@href, "/status/${upvoteAndLike[0].id}")]`,
      ),
    });

    const add: ActionList[] = [];
    if (upvoteAndLike.some((p) => p.type === 'upvote')) {
      await selector.locator('[data-testid="like"]').click();
      add.push({
        id: upvoteAndLike[0].id,
        type: 'upvote',
        comment: '',
      });
      await timer(10000);
    }

    if (upvoteAndLike.some((p) => p.type === 'comment')) {
      const systemPrompt = cursor.getData()['system-prompt'];
      const comment = (await cursor.ai.comment(
        systemPrompt,
        upvoteAndLike[0].text,
      ))!;
      await selector.locator('[data-testid="reply"]').click();
      await page.locator(`[role="dialog"] [contenteditable="true"]`).waitFor();
      await cursor.type(comment, {
        backspaceMaximumDelayInMs: 20,
        backspaceMinimumDelayInMs: 14,
        maximumDelayInMs: 20,
        minimumDelayInMs: 10,
        chanceToKeepATypoInPercent: 100,
        typoChanceInPercent: 0,
      } satisfies HumanTypingOptions);

      await timer(5000);
      await cursor.click('[data-testid="tweetButton"]');
      add.push({
        id: upvoteAndLike[0].id,
        type: 'comment',
        comment,
      });
      await timer(5000);
    }

    await params.cursor.saveActions(add);

    return {
      delay: 0,
      repeatJob: false,
      endWorkflow: true,
    };
  }
}
