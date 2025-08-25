import { random } from 'lodash';

export const timer = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, random(ms, ms * 2)));
};
