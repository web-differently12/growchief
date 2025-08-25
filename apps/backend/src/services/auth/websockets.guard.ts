import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { parse } from 'cookie';
import { EncryptionService } from '@growchief/shared-backend/encryption/encryption.service';
import { HttpUnauthorized } from '@growchief/shared-backend/exceptions/http.exceptions';
import { OrganizationService } from '@growchief/shared-backend/database/organizations/organization.service';

@Injectable()
export class WebsocketsGuard implements CanActivate {
  constructor(private _organizationService: OrganizationService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const cookieHeader = client.handshake?.headers?.cookie ?? '';
    const cookies = parse(cookieHeader);
    const orgHeader = cookies.showorg;

    client.data.user = EncryptionService.verifyJWT(cookies.auth || '');

    const organization = (
      await this._organizationService.getOrgsByUserId(client.data.user.id)
    ).filter((f) => !f.users[0].disabled);
    const setOrg =
      organization.find((org) => org.id === orgHeader) || organization[0];

    if (!organization) {
      throw new HttpUnauthorized();
    }

    client.data.organization = setOrg;

    try {
      client.data.user = EncryptionService.verifyJWT(cookies.auth || '');
      return true;
    } catch (err) {}
    return false;
  }
}
