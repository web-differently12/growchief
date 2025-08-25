import {
  BotAbstract,
  type ParamsValue,
  type RunEnrichment,
  type SpecialEvents,
} from '@growchief/shared-backend/bots/bots.interface';
import type { Page } from 'patchright';
import { timer } from '@growchief/shared-both/utils/timer';
import { Tool } from '@growchief/shared-both/utils/tool.decorator';
import { extractMyProfile } from '@growchief/shared-backend/bots/providers/linkedin/extract.my.profile';
import { extractConnectionTarget } from '@growchief/shared-backend/bots/providers/linkedin/extra.person.profile';
import { compareTwoStrings } from 'string-similarity';
import { ProgressResponse } from '@growchief/shared-backend/temporal/progress.response';

const list = [
  {
    type: 'weekly' as const,
    char: 'You’ve reached the weekly invitation limit',
    message: 'You’ve reached the weekly invitation limit',
  },
  {
    type: 'weekly' as const,
    char: 'Too Many Requests',
    message: 'Too Many Search Requests',
  },
  {
    type: 'weekly' as const,
    char: 'You’re out of invitations for now',
    message: 'You’re out of invitations for now',
  },
  {
    type: 'weekly' as const,
    char: 'Drive more leads and bigger deals with Sales Navigator',
    message: "User doesn't have Linkedin sales nav",
  },
  {
    type: 'weekly' as const,
    char: 'reached the weekly invitation limit',
    message: 'You’ve reached the weekly invitation limit',
  },
];

export class LinkedinProvider extends BotAbstract {
  identifier = 'linkedin';
  label = 'LinkedIn';
  initialPage = 'https://www.linkedin.com';
  disconnectedElement = `.login__form, a[href="https://www.linkedin.com/signup"]`;
  delay = 1800000;
  preventLoadingImages = false;
  headful = true;
  urlRegex = /https:\/\/www\.linkedin\.com\/in\/(.*)/;
  isWWW = true;

  async accountLimited(
    params: ParamsValue,
  ): Promise<Required<ProgressResponse> | false> {
    const body = await params.page.evaluate(
      () => document.querySelector('body')?.innerText || '',
    );

    const find = list.find((p) => body.indexOf(p.char) > -1);
    if (find) {
      return {
        endWorkflow: false,
        delay: 0,
        repeatJob: true,
        restriction: {
          type: find.type,
          message: find.message,
        },
      };
    }

    return false;
  }

  async processLead(params: ParamsValue) {
    const json = await (
      await params.cursor.page.waitForResponse(
        /a1a483e719b20537a256b6853cdca711/gm,
        {
          timeout: 0,
        },
      )
    ).json();

    const person = extractConnectionTarget(json);

    if (!person) {
      return false;
    }

    let picture = '';
    try {
      picture =
        (await params.cursor.page
          .locator('.pv-top-card-profile-picture__image--show')
          .first()
          .getAttribute('src')) || '';
    } catch (err) {}

    return { ...person, picture };
  }

  async login(params: {
    page: Page;
    cursor: SpecialEvents;
  }): Promise<{ picture: string; name: string; id: string } | false> {
    const { page, cursor } = params;
    return Promise.race<{ picture: string; name: string; id: string } | false>([
      new Promise(async (resolve) => {
        try {
          const json = await (
            await page.waitForResponse(/34ead06db82a2cc9a778fac97f69ad6a/gm, {})
          ).json();

          return resolve(extractMyProfile(json));
        } catch (err) {}
      }),
      new Promise(async (_) => {
        try {
          await page.goto('https://www.linkedin.com');
          await page
            .locator("//a[contains(text(), 'Sign in with email')]")
            .waitFor();
          await timer(5000);
          await cursor.click("//a[contains(text(), 'Sign in with email')]");
          await timer(5000);

          await page.waitForSelector('#username');
          cursor.startMouse();

          await timer(600000);
        } catch (err) {}
      }),
    ]);
  }

  @Tool({
    priority: 1,
    title: 'Send Connection Request',
    identifier: 'linkedin-send-connection-request',
    allowedBeforeIdentifiers: [],
    notAllowedBeforeIdentifiers: [
      'linkedin-send-connection-request',
      'linkedin-send-message',
    ],
    description: 'Send a connection request',
    notAllowedBeforeIdentifier: [
      'linkedin-send-connection-request',
      'linkedin-send-message',
    ],
    maxChildren: 1,
    weeklyLimit: 100,
  })
  async connectionRequest(params: ParamsValue, lead: RunEnrichment) {
    if (lead.degree === 1) {
      return {
        delay: 0,
        repeatJob: false,
        endWorkflow: true,
      };
    }

    const header = params.page
      .locator('.top-card-background-hero-image + div .artdeco-button')
      .first();

    await header.waitFor();

    const getMenus = (
      await Promise.all(
        (
          await params.page
            .locator('.top-card-background-hero-image + div .artdeco-button')
            .all()
        ).map(async (p, index) => {
          return (await p.innerHTML()).toLowerCase().indexOf('connect') > -1
            ? index
            : false;
        }),
      )
    ).find((p) => p !== false);

    if (typeof getMenus !== 'undefined') {
      await params.cursor.click(
        params.page
          .locator('.top-card-background-hero-image + div .artdeco-button')
          .nth(getMenus),
      );
    } else {
      await params.cursor.click(
        '.top-card-background-hero-image + div .artdeco-dropdown',
      );

      const dropDown = params.page.locator(
        '.top-card-background-hero-image + div .artdeco-dropdown .artdeco-dropdown__content-inner',
      );

      await dropDown.waitFor({ state: 'visible' });

      const getAllItems = (
        await Promise.all(
          (await dropDown.locator('li').all()).map(async (p, index) => {
            return (await p.innerHTML()).toLowerCase().indexOf('connect') > -1
              ? index
              : false;
          }),
        )
      ).find((p) => p !== false);

      if (typeof getAllItems !== 'undefined') {
        await params.cursor.click(dropDown.locator('li').nth(getAllItems));
      } else {
        return {
          delay: 0,
          repeatJob: false,
          endWorkflow: true,
        };
      }
    }
    const data = await params.cursor.getData();

    await params.page
      .locator('.artdeco-modal__actionbar button:nth-child(2)')
      .waitFor({ state: 'visible' });

    if (!data.message) {
      await params.cursor.click(
        '.artdeco-modal__actionbar button:nth-child(2)',
      );
    } else {
      await params.cursor.click(
        '.artdeco-modal__actionbar button:nth-child(1)',
      );

      const messageBox = params.page.locator(
        '.connect-button-send-invite__custom-message-box',
      );

      await messageBox.waitFor({ state: 'visible' });

      await params.cursor.click(messageBox);
      await params.cursor.type(data.message);
      await timer(2000);

      await params.cursor.click(
        '.artdeco-modal__actionbar button:nth-last-child(1)',
      );
    }

    await params.page.locator('.artdeco-modal').waitFor({ state: 'detached' });

    await timer(10000);

    return {
      delay: 0,
      repeatJob: false,
      endWorkflow: false,
    };
  }

  @Tool({
    priority: 2,
    title: 'Send follow up Message',
    identifier: 'linkedin-send-followup-message',
    allowedBeforeIdentifiers: ['linkedin-send-message'],
    notAllowedBeforeIdentifiers: [],
    description: 'Send a message',
    notAllowedBeforeIdentifier: [
      'linkedin-send-message',
      'linkedin-send-followup-message',
    ],
    maxChildren: 1,
  })
  @Tool({
    priority: 3,
    title: 'Send Message',
    identifier: 'linkedin-send-message',
    allowedBeforeIdentifiers: [],
    notAllowedBeforeIdentifiers: [
      'linkedin-send-followup-message',
      'linkedin-send-message',
    ],
    description: 'Send a message',
    notAllowedBeforeIdentifier: [
      'linkedin-send-message',
      'linkedin-send-connection-request',
    ],
    maxChildren: 1,
  })
  async sendMessage(params: ParamsValue, lead: RunEnrichment) {
    if (lead.degree !== 1 || lead.pending) {
      return {
        delay: 0,
        repeatJob: false,
        endWorkflow: true,
      };
    }

    const data = await params.cursor.getData();

    const header = params.page
      .locator(
        '.top-card-background-hero-image + div .entry-point .artdeco-button',
      )
      .first();

    await header.waitFor();

    await params.cursor.click(header);

    const convo = params.page
      .locator('.msg-convo-wrapper', {
        hasText: `${lead.firstName} ${lead.lastName}`,
      })
      .first();

    await convo.waitFor({ state: 'visible' });

    const getAllMessages = convo.locator('.msg-s-event-listitem__body');
    await getAllMessages.first().waitFor();

    const allMessagesContent = (await getAllMessages.allInnerTexts()).map((p) =>
      p.trim(),
    );

    if (
      allMessagesContent.some((p) => compareTwoStrings(p, data.message) > 0.95)
    ) {
      return {
        delay: 0,
        repeatJob: false,
        endWorkflow: false,
      };
    }

    await timer(1000);
    const textArea = convo.locator('[contenteditable="true"]').first();

    await textArea.waitFor({ state: 'visible' });

    await params.cursor.click(textArea);

    await timer(1000);

    await params.cursor.type(data.message);

    const isSubmitButton = convo
      .locator('button[type="submit"]:not(:disabled)')
      .first();

    try {
      await isSubmitButton.waitFor({ state: 'visible', timeout: 5000 });
      await params.cursor.click(isSubmitButton);
    } catch (err) {
      await params.page.keyboard.press('Enter');
    }

    await convo
      .locator('button[type="submit"]:disabled')
      .waitFor({ state: 'visible' });

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
    notAllowedBeforeIdentifier: ['add-account', 'delay'],
    maxChildren: 1,
  })
  async delayAccount(params: ParamsValue) {
    return {
      endWorkflow: false,
      delay: this.delay,
      repeatJob: false,
    };
  }
}
