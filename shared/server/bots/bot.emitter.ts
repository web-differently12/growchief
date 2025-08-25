import { EventEmitter } from 'events';

export class BotEmitter {
  static emitter: EventEmitter<any> = new EventEmitter();
}
