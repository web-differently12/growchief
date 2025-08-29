import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type {
  Organization,
  Subscription,
  User,
  UserOrganization,
} from '@prisma/client';
import type { Response } from 'express';
import { PermissionList } from '@growchief/shared-backend/billing/permissions.list';
import { UsersService } from '@growchief/shared-backend/database/users/users.service';
import { GetUserFromRequest } from '@growchief/backend/services/auth/user.from.request';
import { AcceptOrDeclineInviteDto } from '@growchief/shared-both/dto/team/accept.or.decline.invite.dto';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import { getUrlFromDomain } from '@growchief/shared-both/utils/get.url.from.domain';

@Controller('/users')
export class UsersController {
  constructor(
    public permissionList: PermissionList,
    private _userService: UsersService,
  ) {}

  @Get('/invites')
  async getInvites(@GetUserFromRequest() user: User) {
    return this._userService.getInvites(user.email);
  }

  @Post('/invite/:id')
  async acceptOrDeclineInvite(
    @Param('id') id: string,
    @GetUserFromRequest() user: User,
    @Body() body: AcceptOrDeclineInviteDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const invite = await this._userService.acceptOrDeclineInvite(
      id,
      user.id,
      user.email,
      body,
    );

    if (body.action === 'accept') {
      response.cookie('showorg', invite.organizationId, {
        domain: getUrlFromDomain(process.env.FRONTEND_URL!),
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      });
    }

    return invite;
  }

  @Get('/self')
  async self(
    @GetUserFromRequest() user: User,
    @GetOrganizationFromRequest()
    org: Organization & {
      subscription?: Subscription;
      users: UserOrganization[];
    },
  ) {
    const roles = !org.subscription
      ? undefined
      : this.permissionList.list.reduce((all, current) => {
          const permission = current.definitions.find(
            (p) => p.identifier === org.subscription?.identifier,
          );

          return {
            ...all,
            [current.identifier]: {
              enabled: !!(
                permission?.enabled &&
                current.level.indexOf(org.users[0].role) > -1
              ),
              total: permission?.total,
            },
          };
        }, {});

    return { ...user, org, roles, selfhosted: !process.env.BILLING_PROVIDER };
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('auth', '', {
      domain: getUrlFromDomain(process.env.FRONTEND_URL!),
      expires: new Date(Date.now() - 10000),
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    return { success: true };
  }

  @Get('/all-users')
  async getAllUsers(@Query() query: { search: string }) {
    return this._userService.getAllUsers(query.search);
  }
}
