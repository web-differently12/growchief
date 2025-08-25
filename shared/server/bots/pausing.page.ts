import {
  BehaviorSubject,
  firstValueFrom,
  filter,
  Observable,
  Subject,
} from 'rxjs';
import { Page } from 'patchright';

export function createPageWrapper(
  page: Page,
  pauseSubject: BehaviorSubject<boolean>,
  pause$: Observable<any>,
  saveLog$: Subject<{ message: string; type: string; args: string[] }>,
) {
  return page;
  async function waitIfPaused() {
    if (pauseSubject.value) {
      await firstValueFrom(pause$.pipe(filter((paused) => !paused)));
    }
  }

  const handler = {
    get(target: any, prop: PropertyKey, a: any) {
      const origProp = target[prop];

      if (typeof origProp === 'function') {
        if (target[prop].constructor.name !== 'AsyncFunction') {
          return (...args: any[]) => {
            return origProp.apply(target, args);
          };
        }

        return async (...args: any[]) => {
          saveLog$.next({
            message: String(prop),
            args,
            type: 'info',
          });
          await waitIfPaused();
          while (true) {
            try {
              return await origProp.apply(target, args);
            } catch (err) {
              if (pauseSubject.value) {
                await waitIfPaused(); // wait for resume and retry
                continue;
              }
              throw err;
            }
          }
        };
      } else {
        saveLog$.next({
          message: String(prop),
          args: [],
          type: 'info',
        });
      }

      return origProp;
    },
  };

  return new Proxy(page, handler);
}
