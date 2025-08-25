import { IsNumber } from 'class-validator';

export class Delay {
  @IsNumber()
  hours = 24;
}
