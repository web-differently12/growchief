import { Page } from 'patchright';

export interface HumanTypingOptions {
  backspaceMaximumDelayInMs?: number;
  backspaceMinimumDelayInMs?: number;
  chanceToKeepATypoInPercent?: number;
  keyboardLayout?: string;
  keyboardLayouts?: Record<string, string[][]>;
  maximumDelayInMs?: number;
  minimumDelayInMs?: number;
  typoChanceInPercent?: number;
}

const BACKSPACE = 'Backspace';
const ENTER = 'Enter';

export class TypingTool {
  private keyboardLayout: string[][];
  public opts: HumanTypingOptions;

  constructor(options: HumanTypingOptions = {}) {
    this.opts = { ...this.defaults, ...options };
    this.keyboardLayout =
      this.opts.keyboardLayouts?.[this.opts.keyboardLayout || 'en'] ||
      this?.defaults?.keyboardLayouts?.en!;
  }

  get defaults(): HumanTypingOptions {
    return {
      backspaceMaximumDelayInMs: 750 * 2,
      backspaceMinimumDelayInMs: 750,
      chanceToKeepATypoInPercent: 0,
      keyboardLayout: 'en',
      keyboardLayouts: {
        en: [
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
          ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '['],
          ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
          ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
        ],
      },
      maximumDelayInMs: 650,
      minimumDelayInMs: 150,
      typoChanceInPercent: 15,
    };
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private _getCharacterCoordinates(
    character: string,
  ): { row: number; column: number } | null {
    const characterLowerCased = character.toLowerCase();

    if (!this._isInKeyboardLayout(characterLowerCased)) {
      return null;
    }

    const keyboardLayout = this.keyboardLayout;

    for (let row = 0; row < keyboardLayout.length; row++) {
      for (let column = 0; column < keyboardLayout[row].length; column++) {
        if (keyboardLayout[row][column] === characterLowerCased) {
          return {
            column,
            row,
          };
        }
      }
    }

    return null;
  }

  private _getCharacterCloseTo(character: string, attempt = 0): string {
    if (attempt > 3) {
      return character;
    }

    const characterLowerCased = character.toLowerCase();

    if (!this._isInKeyboardLayout(characterLowerCased)) {
      return character;
    }

    const characterCoordinates = this._getCharacterCoordinates(character);

    if (characterCoordinates === null) {
      return character;
    }

    const isCharacterLowerCase = character.toLowerCase() === character;

    let possibleColumns: number[] = [];
    let possibleRows: number[] = [];

    const _c = characterCoordinates.column;
    const _r = characterCoordinates.row;

    /** A higher chance to select characters to the left and right, than above and below. (75%) */
    if (this._getRandomIntegerBetween(0, 100) <= 75) {
      possibleRows = [characterCoordinates.row];
    } else {
      if (_r === 0) {
        possibleRows = [_r, _r + 1];
      } else if (_r === this.keyboardLayout.length - 1) {
        possibleRows = [_r - 1, _r];
      } else {
        possibleRows = [_r - 1, _r, _r + 1];
      }
    }

    if (_c === 0) {
      possibleColumns = [_c, _c + 1];
    } else if (_c === this.keyboardLayout[_r].length - 1) {
      possibleColumns = [_c - 1, _c];
    } else {
      possibleColumns = [_c - 1, _c, _c + 1];
    }

    const selectedColumn =
      possibleColumns[Math.floor(Math.random() * possibleColumns.length)];
    const selectedRow =
      possibleRows[Math.floor(Math.random() * possibleRows.length)];

    const result = this.keyboardLayout[selectedRow][selectedColumn] ?? null;

    /** This can happen because each line ("row") must not have the same length/number of letters ("columns"). */
    if (result === null) {
      return character;
    }

    /** If we accidentally get the same character, we try again (but no more than 5 times). */
    if (result === characterLowerCased) {
      return this._getCharacterCloseTo(character, attempt + 1);
    }

    return isCharacterLowerCase ? result : result.toUpperCase();
  }

  private _getRandomIntegerBetween(a: number, b: number): number {
    return Math.floor(Math.random() * (b - a + 1) + a);
  }

  private _getTypingFlow(text: string): string[] {
    const typingFlow: string[] = [];

    const characters = text.split('');

    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      const characterLowerCased = character.toLowerCase();

      /** We take one third of "typoChanceInPercent" to write a space twice. However, we will not remove this one. */
      const hasSpaceTypo =
        character === ' ' &&
        this._getRandomIntegerBetween(0, 100) <=
          (this.opts.typoChanceInPercent || 0) / 3;

      if (hasSpaceTypo) {
        typingFlow.push(' ');
      }

      const hasTypo =
        this._isInKeyboardLayout(characterLowerCased) &&
        this._getRandomIntegerBetween(0, 100) <=
          (this.opts.typoChanceInPercent || 0);

      if (hasTypo) {
        typingFlow.push(this._getCharacterCloseTo(character));
        typingFlow.push(BACKSPACE);
      }

      typingFlow.push(character);

      /** We take half of "typoChanceInPercent" to write a character twice. */
      const hasDoubleCharacterTypo =
        this._isInKeyboardLayout(characterLowerCased) &&
        this._getRandomIntegerBetween(0, 100) <=
          (this.opts.typoChanceInPercent || 0) / 2;

      if (hasDoubleCharacterTypo) {
        typingFlow.push(character);
        typingFlow.push(BACKSPACE);
      }
    }

    return typingFlow;
  }

  private _isInKeyboardLayout(character: string): boolean {
    for (const row of this.keyboardLayout) {
      if (row.includes(character)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Types a new line character without randomness
   */
  async newLine(page: Page): Promise<void> {
    await page.keyboard.press(ENTER);
  }

  async write(
    page: Page,
    text: string,
    options: HumanTypingOptions = {},
  ): Promise<void> {
    return page.keyboard.type(text, {
      delay: 60,
    });
  }
}
