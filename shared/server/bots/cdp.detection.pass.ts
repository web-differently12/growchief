import { Page } from 'patchright';

export const cdpDetectionPass = async (page: Page) => {
  await page.addInitScript(`
(function() {
    var originalError = Error;

    // Lock down the stack property on Error.prototype to prevent modification
    Object.defineProperty(Error.prototype, 'stack', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: (function() {
            try {
                throw new originalError();
            } catch (e) {
                return e.stack;
            }
        })()
    });

    // Proxy the Error constructor to prevent any instance-specific stack modifications
    window.Error = new Proxy(originalError, {
        construct(target, args) {
            var instance = new target(...args);

            // Freeze the instance to prevent any modifications
            return Object.freeze(instance);
        }
    });
})();
`);
};
