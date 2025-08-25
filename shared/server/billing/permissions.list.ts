import { CreateTeamPermission } from '@growchief/shared-backend/billing/permissions/create.team.permission';
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  PermissionClass,
  PermissionInterface,
} from '@growchief/shared-backend/billing/permission.interface';
import { ModuleRef } from '@nestjs/core';
import { SocialActionsPermission } from '@growchief/shared-backend/billing/permissions/social.actions.permission';
import { WorkflowActionsPermission } from '@growchief/shared-backend/billing/permissions/workflow.actions.permission';
import { AddAccountsPermission } from '@growchief/shared-backend/billing/permissions/add.accounts.permission';
import { AddProxiesPermission } from '@growchief/shared-backend/billing/permissions/add.proxies.permission';

export const permissionsList = [
  AddAccountsPermission,
  SocialActionsPermission,
  CreateTeamPermission,
  WorkflowActionsPermission,
  AddProxiesPermission,
] satisfies PermissionClass[] as PermissionClass[];

@Injectable()
export class PermissionList implements OnModuleInit {
  list: PermissionInterface[] = [];
  constructor(private _moduleRef: ModuleRef) {}
  onModuleInit() {
    this.list = permissionsList.map((permission) => {
      return this._moduleRef.get<PermissionInterface>(permission, {
        strict: false,
      });
    });
  }
}
