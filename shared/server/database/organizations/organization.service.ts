import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { OrganizationRepository } from '@growchief/shared-backend/database/organizations/organization.repository';
import { EmailService } from '@growchief/shared-backend/email/email.service';
import { CreateOrgUserDto } from '@growchief/shared-both/dto/auth/create.org.user.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private _organizationRepository: OrganizationRepository,
    private _emailService: EmailService,
  ) {}
  async createOrgAndUser(
    body: Omit<CreateOrgUserDto, 'providerToken' | 'website'> & {
      providerId?: string;
    },
  ) {
    return this._organizationRepository.createOrgAndUser(
      body,
      this._emailService.hasProvider(),
    );
  }

  async getCount() {
    return this._organizationRepository.getCount();
  }

  async getOrgsByUserId(userId: string) {
    return this._organizationRepository.getOrgsByUserId(userId);
  }

  addUserToOrg(
    userId: string,
    id: string,
    orgId: string,
    role: 'USER' | 'ADMIN',
  ) {
    return this._organizationRepository.addUserToOrg(userId, id, orgId, role);
  }

  getOrganizationByPaymentId(paymentId: string) {
    return this._organizationRepository.getOrganizationByPaymentId(paymentId);
  }

  listInvitesPerOrganization(org: string) {
    return this._organizationRepository.listInvitesPerOrganization(org);
  }

  listUsersPerOrganization(org: string) {
    return this._organizationRepository.listUsersPerOrganization(org);
  }

  async inviteMember(org: string, email: string, role: Role) {
    const invite = await this._organizationRepository.inviteMember(
      org,
      email,
      role,
    );
    await this._emailService.sendEmail(
      email,
      'Invitation to join organization',
      `
    You are being invited to use GrowChief.<br />
    <a href="${process.env.FRONTEND_URL}">Register / Login to the system.</a><br />
    Make sure you register with the email: ${email}
`,
    );
    return invite;
  }

  deleteMember(org: string, email: string) {
    return this._organizationRepository.deleteMember(org, email);
  }

  getOrgByApiKey(apiKey: string) {
    return this._organizationRepository.getOrgByApiKey(apiKey);
  }
}
