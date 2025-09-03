import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { WorkflowsService } from '@growchief/shared-backend/database/workflows/workflows.service';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import type { Organization } from '@prisma/client';
import { UpdateWorkflow } from '@growchief/shared-both/dto/platforms/update.workflow.dto';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';
import { UploadLeadsDto } from '@growchief/shared-both/dto/workflows/upload.leads.dto';

@SubscriptionRequired()
@Controller('/workflows')
export class WorkflowsController {
  constructor(private _workflowsService: WorkflowsService) {}

  @Get()
  async getWorkflows(@GetOrganizationFromRequest() organization: Organization) {
    return this._workflowsService.getWorkflows(organization.id);
  }

  @Get('/:id/running-workflows')
  async totalRunningWorkflows(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.totalRunningWorkflows(id, organization.id);
  }

  @Post('/:id/cancel-jobs')
  async cancelJobs(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.cancelJobs(id, organization.id);
  }

  @Post('/:id/upload-leads')
  async uploadLeads(
    @Param('id') id: string,
    @Body() body: UploadLeadsDto,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.uploadLeads(id, organization.id, body);
  }

  @Get('/:id/import-url-list')
  async importURLList(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.importURLList(id, organization.id);
  }

  @Get('/:id')
  async getWorkflow(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.getWorkflow(id, organization.id);
  }

  @Post()
  async createWorkflow(
    @Body('name') name: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.createWorkflow(organization.id, name);
  }

  @Put('/:id')
  async updateWorkflow(
    @Param('id') id: string,
    @Body() data: UpdateWorkflow,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.updateWorkflow(id, organization.id, data);
  }

  @Delete('/:id')
  async deleteWorkflow(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.deleteWorkflow(id, organization.id);
  }

  // Statistics endpoints
  @Get('/stats/dashboard')
  async getDashboardStats(
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.getDashboardStats(organization.id);
  }

  @Get('/stats/workflows-count')
  async getWorkflowsCount(
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return {
      count: await this._workflowsService.getWorkflowsCount(organization.id),
    };
  }

  @Get('/stats/active-workflows-count')
  async getActiveWorkflowsCount(
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return {
      count: await this._workflowsService.getActiveWorkflowsCount(
        organization.id,
      ),
    };
  }

  @Post('/change-activity/:id')
  async changeWorkflowActivity(
    @Param('id') id: string,
    @Body('active') active: boolean,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._workflowsService.changeWorkflowActivity(
      id,
      organization.id,
      active,
    );
  }
}
