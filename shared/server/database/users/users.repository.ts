import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { EncryptionService } from '@growchief/shared-backend/encryption/encryption.service';
import { PrismaRepository } from '@growchief/shared-backend/database/prisma';
import { AcceptOrDeclineInviteDto } from '@growchief/shared-both/dto/team/accept.or.decline.invite.dto';

@Injectable()
export class UsersRepository {
  constructor(
    private _user: PrismaRepository<'user'>,
    private _organization: PrismaRepository<'organization'>,
    private _userOrganization: PrismaRepository<'userOrganization'>,
    private _invites: PrismaRepository<'invites'>,
  ) {}

  getUserById(id: string) {
    return this._user.model.user.findFirst({
      where: {
        id,
      },
    });
  }

  getUserByEmail(email: string) {
    return this._user.model.user.findFirst({
      where: {
        email,
        providerName: Provider.LOCAL,
      },
    });
  }

  activateUser(id: string) {
    return this._user.model.user.update({
      where: {
        id,
      },
      data: {
        activated: true,
      },
    });
  }

  getUserByProvider(providerId: string, provider: Provider) {
    return this._user.model.user.findFirst({
      where: {
        providerId,
        providerName: provider,
      },
    });
  }

  updatePassword(id: string, password: string) {
    return this._user.model.user.update({
      where: {
        id,
        providerName: Provider.LOCAL,
      },
      data: {
        password: EncryptionService.hashPassword(password),
      },
    });
  }

  async getOrganizationsList(id: string) {
    return (
      await this._userOrganization.model.userOrganization.findMany({
        where: {
          userId: id,
          deletedAt: null,
        },
        select: {
          organization: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      })
    ).map((p) => p.organization);
  }

  getUserRole(org: string, email: string) {
    return this._userOrganization.model.userOrganization.findFirst({
      where: {
        organizationId: org,
        user: {
          email,
        },
      },
    });
  }

  getInviteByEmail(org: string, email: string) {
    return this._invites.model.invites.findFirst({
      where: {
        organizationId: org,
        email,
        status: { in: ['PENDING', 'REJECTED'] },
      },
    });
  }

  getInvites(email: string) {
    return this._invites.model.invites.findMany({
      where: {
        email,
        status: 'PENDING',
      },
      select: {
        id: true,
        role: true,
        organization: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });
  }

  async acceptOrDeclineInvite(
    id: string,
    userId: string,
    email: string,
    body: AcceptOrDeclineInviteDto,
  ) {
    const { organizationId, role } = await this._invites.model.invites.update({
      where: {
        id,
        email,
      },
      data: {
        status: body.action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      },
    });

    if (body.action === 'accept') {
      await this._userOrganization.model.userOrganization.create({
        data: {
          userId,
          organizationId,
          role,
        },
      });
    }

    return {
      organizationId,
      role,
      userId,
    };
  }

  getAllUsers(search: string) {
    return this._userOrganization.model.userOrganization.findMany({
      where: {
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { id: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        organizationId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  getOrgUser(orgUserId: string) {
    return this._userOrganization.model.userOrganization.findFirst({
      where: {
        id: orgUserId,
      },
      select: {
        user: true,
        organizationId: true,
      },
    });
  }
}
