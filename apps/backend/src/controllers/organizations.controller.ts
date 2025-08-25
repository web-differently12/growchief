import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { Organization, User } from '@prisma/client';
import { UsersService } from '@growchief/shared-backend/database/users/users.service';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import { GetUserFromRequest } from '@growchief/backend/services/auth/user.from.request';
import { getUrlFromDomain } from '@growchief/shared-both/utils/get.url.from.domain';

@Controller('/organizations')
export class OrganizationsController {
  constructor(private _userService: UsersService) {}
  @Get('/current')
  async getCurrentOrganization(
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return organization;
  }

  @Get('/list')
  getList(@GetUserFromRequest() user: User) {
    return this._userService.getOrganizationsList(user.id);
  }

  @Post('/change')
  changeOrg(
    @Body('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.cookie('showorg', id, {
      domain: getUrlFromDomain(process.env.FRONTEND_URL!),
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });
    return { change: true };
  }
}
