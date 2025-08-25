import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { OrganizationService } from '@growchief/shared-backend/database/organizations/organization.service';
import type { Organization } from '@prisma/client';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import { InviteDto } from '@growchief/shared-both/dto/team/invite.dto';
import { DeleteDto } from '@growchief/shared-both/dto/team/delete.dto';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';

@SubscriptionRequired()
@Controller('/teams')
export class TeamController {
  constructor(private _organizationService: OrganizationService) {}
  @Get('/list')
  async getList(@GetOrganizationFromRequest() organization: Organization) {
    const invites = await this._organizationService.listInvitesPerOrganization(
      organization.id,
    );
    const users = await this._organizationService.listUsersPerOrganization(
      organization.id,
    );
    return {
      users,
      invites,
    };
  }

  @Post('/invite')
  inviteMember(
    @GetOrganizationFromRequest() organization: Organization,
    @Body() body: InviteDto,
  ) {
    return this._organizationService.inviteMember(
      organization.id,
      body.email,
      body.role,
    );
  }

  @Delete('/')
  deleteInviteAndMember(
    @Body() body: DeleteDto,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._organizationService.deleteMember(organization.id, body.email);
  }
}
