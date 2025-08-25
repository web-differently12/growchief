import { Page } from 'patchright';
import {
  CheckAction,
  type RunEnrichment,
  SpecialEvents,
} from '@growchief/shared-backend/bots/bots.interface';
import { Locator } from 'patchright';
import { path } from 'ghost-cursor';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  HumanTypingOptions,
  TypingTool,
} from '@growchief/shared-backend/bots/typing.tool';
import { createPageWrapper } from '@growchief/shared-backend/bots/pausing.page';
import { timer } from '@growchief/shared-both/utils/timer';

const writer = new TypingTool();

export const createCursor = (params: {
  saveLog$: Subject<{ message: string; type: string; args: string[] }>;
  loadPage: Page;
  screenShare: Subject<any>;
  data: any;
}): SpecialEvents => {
  const { saveLog$, loadPage, screenShare, data } = params;

  const pauseSubject = new BehaviorSubject<boolean>(false);
  const pause$ = pauseSubject.asObservable();

  const lastKnownLocation = {
    x: 0,
    y: 0,
  };

  const page: Page = createPageWrapper(
    loadPage,
    pauseSubject,
    pause$,
    saveLog$,
  );

  let processedData = data;
  return {
    page,
    setDataVariables: (lead: RunEnrichment) => {
      processedData = JSON.parse(
        JSON.stringify(processedData)
          .replace(/\{\{ firstName }}/g, lead.firstName)
          .replace(/\{\{ lastName }}/g, lead.lastName),
      );
    },
    getData: () => {
      return processedData;
    },
    async waitForCookie(name: string, timeout = 360000) {
      const start = Date.now();

      while (Date.now() - start < timeout) {
        const cookies = await page.context().cookies();
        const cookie = cookies.find((c) => c.name === name);
        if (cookie) return cookie.value;

        await page.waitForTimeout(100); // wait briefly before trying again
      }

      throw new Error(`Cookie "${name}" not found within ${timeout}ms`);
    },
    click: async (
      element: string | Locator,
      spreadOverride?: number,
      clientBoundingBox?: boolean,
    ) => {
      for (const a of [1, 2, 3]) {
        try {
          const elementPosition = clientBoundingBox
            ? await page.evaluate((e) => {
                return document
                  ?.querySelector(e as string)
                  ?.getBoundingClientRect();
              }, element)
            : typeof element === 'string'
              ? await (await page.$(element))?.boundingBox()
              : await element.boundingBox();

          const middleOfElement = {
            x: elementPosition?.x! + elementPosition?.width! / 2,
            y: elementPosition?.y! + elementPosition?.height! / 2,
          };

          const route = path(lastKnownLocation, middleOfElement, {
            moveSpeed: 50,
            spreadOverride,
          });

          for (const step of route) {
            await page.mouse.move(step.x, step.y);
          }
          await timer(100);
          await page.mouse.click(
            route[route.length - 1].x,
            route[route.length - 1].y,
          );
          lastKnownLocation.x = route[route.length - 1].x;
          lastKnownLocation.y = route[route.length - 1].y;

          return;
        } catch (err) {}
      }
    },
    move: async (
      element: string | Locator,
      spreadOverride?: number,
      clientBoundingBox?: boolean,
    ) => {
      for (const a of [1, 2, 3]) {
        try {
          const elementPosition = clientBoundingBox
            ? await page.evaluate((e) => {
                return document
                  ?.querySelector(e as string)
                  ?.getBoundingClientRect();
              }, element)
            : typeof element === 'string'
              ? await (await page.$(element))?.boundingBox()
              : await element.boundingBox();

          const middleOfElement = {
            x: elementPosition?.x! + elementPosition?.width! / 2,
            y: elementPosition?.y! + elementPosition?.height! / 2,
          };

          const route = path(lastKnownLocation, middleOfElement, {
            moveSpeed: 50,
            spreadOverride,
          });

          for (const step of route) {
            await page.mouse.move(step.x, step.y);
          }
          await timer(100);
          lastKnownLocation.x = route[route.length - 1].x;
          lastKnownLocation.y = route[route.length - 1].y;

          return;
        } catch (err) {}
      }
    },
    simpleMove: async (element: string | Locator, spreadOverride?: number) => {
      for (const a of [1, 2, 3]) {
        try {
          const elementPosition =
            typeof element === 'string'
              ? await (await page.$(element))?.boundingBox()
              : await element.boundingBox();
          const middleOfElement = {
            x: elementPosition?.x! + elementPosition?.width! / 2,
            y: elementPosition?.y! + elementPosition?.height! / 2,
          };

          await page.mouse.move(middleOfElement.x, middleOfElement.y, {
            steps: 50,
          });
          lastKnownLocation.x = middleOfElement.x;
          lastKnownLocation.y = middleOfElement.y;

          return;
        } catch (err) {}
      }
    },
    simpleMoveAndClick: async (
      element: string | Locator,
      spreadOverride?: number,
    ) => {
      for (const a of [1, 2, 3]) {
        try {
          const elementPosition =
            typeof element === 'string'
              ? await (await page.$(element))?.boundingBox()
              : await element.boundingBox();
          const middleOfElement = {
            x: elementPosition?.x! + elementPosition?.width! / 2,
            y: elementPosition?.y! + elementPosition?.height! / 2,
          };

          await page.mouse.move(middleOfElement.x, middleOfElement.y, {
            steps: 50,
          });
          await page.mouse.click(middleOfElement.x, middleOfElement.y);
          lastKnownLocation.x = middleOfElement.x;
          lastKnownLocation.y = middleOfElement.y;
          return;
        } catch (err) {}
      }
    },
    scrollToElement: async (elementIdentifier: string, num?: number) => {
      for (const a of [1, 2, 3]) {
        try {
          await page.evaluate(
            ({ elm, num }) => {
              return new Promise((resolve) => {
                document.addEventListener('scrollend', resolve, { once: true });
                const element = document.querySelectorAll(elm)[num];

                element.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'center',
                });

                if (element) {
                  setTimeout(() => {
                    try {
                      resolve(true);
                    } catch (err) {}
                  }, 3000);
                }
              });
            },
            { elm: elementIdentifier, num: num || 0 },
          );

          await timer(2000);
          return;
        } catch (err) {}
      }
    },
    type(text: string, options?: HumanTypingOptions) {
      return writer.write(
        page,
        text,
        options ||
          ({
            backspaceMaximumDelayInMs: 13,
            backspaceMinimumDelayInMs: 7,
            maximumDelayInMs: 10,
            minimumDelayInMs: 5,
            chanceToKeepATypoInPercent: 100,
            typoChanceInPercent: 5,
          } satisfies HumanTypingOptions),
      );
    },
    startMouse() {
      return screenShare.next('start');
    },
    endMouse() {
      return screenShare.next('stop');
    },
    pause: () => {
      pauseSubject.next(true);
    },
    resume: () => {
      pauseSubject.next(false);
    },
    get scrollUntilElementIsVisible() {
      return async (element: string): Promise<true> => {
        const waitForVisible = () => {
          return page.evaluate((e) => {
            return document.querySelector(e);
          }, element);
        };

        const scrollDown = () => {
          return page.mouse.wheel(0, 50);
        };

        while (true) {
          if (page.isClosed()) {
            return true;
          }
          const visible = await waitForVisible();
          await timer(2000);
          if (visible) {
            await this.scrollToElement(element);
            return true;
          }

          await scrollDown();
        }
      };
    },
  };
};
