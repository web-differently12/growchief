import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { UsersRepository } from '@growchief/shared-backend/database/users/users.repository';
import { AcceptOrDeclineInviteDto } from '@growchief/shared-both/dto/team/accept.or.decline.invite.dto';

@Injectable()
export class UsersService {
  constructor(private _usersRepository: UsersRepository) {}

  getUserByEmail(email: string) {
    return this._usersRepository.getUserByEmail(email);
  }

  getUserByProvider(providerId: string, provider: Provider) {
    return this._usersRepository.getUserByProvider(providerId, provider);
  }

  activateUser(id: string) {
    return this._usersRepository.activateUser(id);
  }

  updatePassword(id: string, password: string) {
    return this._usersRepository.updatePassword(id, password);
  }

  getOrganizationsList(id: string) {
    return this._usersRepository.getOrganizationsList(id);
  }

  getUserRole(org: string, id: string) {
    return this._usersRepository.getUserRole(org, id);
  }

  getInviteByEmail(org: string, email: string) {
    return this._usersRepository.getInviteByEmail(org, email);
  }

  getInvites(email: string) {
    return this._usersRepository.getInvites(email);
  }

  acceptOrDeclineInvite(
    id: string,
    userId: string,
    email: string,
    body: AcceptOrDeclineInviteDto,
  ) {
    return this._usersRepository.acceptOrDeclineInvite(id, userId, email, body);
  }

  getAllUsers(search: string) {
    return this._usersRepository.getAllUsers(search);
  }

  getOrgUser(orgUserId: string) {
    return this._usersRepository.getOrgUser(orgUserId);
  }
}
