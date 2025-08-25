import {
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
