import { Injectable } from '@nestjs/common';
import { PlugsRepository } from '@growchief/shared-backend/database/plugs/plugs.repository';
@Injectable()
export class PlugsService {
  constructor(private _plugsRepository: PlugsRepository) {}
}
