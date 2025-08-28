import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@growchief/shared-backend/database/prisma';
import {
  Nodes,
  UpdateWorkflow,
} from '@growchief/shared-both/dto/platforms/update.workflow.dto';

@Injectable()
export class WorkflowsRepository {
  constructor(
    private _workflows: PrismaRepository<'workflows'>,
    private _workflowNodes: PrismaRepository<'workflowNodes'>,
  ) {}

  async getWorkflowAccounts(workflowId: string, organizationId?: string) {
    return this._workflowNodes.model.workflowNodes.findFirst({
      where: {
        ...(organizationId ? { organizationId } : {}),
        workflowId,
        type: 'api',
      },
      select: {
        organizationId: true,
        workflow: true,
        children: true,
      },
    });
  }

  async getWorkflowsByOrganization(organizationId: string) {
    return this._workflows.model.workflows.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getInitialNodes(workflowId: string) {
    return this._workflowNodes.model.workflowNodes.findMany({
      where: {
        workflowId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getWorkflowById(id: string, organizationId?: string) {
    return this._workflows.model.workflows.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
        deletedAt: null,
      },
      include: {
        nodes: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async createWorkflow(organizationId: string, name: string) {
    return this._workflows.model.workflows.create({
      data: {
        name,
        organizationId,
        active: false,
        nodes: {
          create: {
            organizationId,
            parentId: null,
            type: 'api',
            position: JSON.stringify({ x: 0, y: 0 }),
            data: JSON.stringify({}),
          },
        },
      },
      select: {
        id: true,
        name: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        nodes: true,
      },
    });
  }

  private _arrangeNodes(node: Nodes, nodes: Nodes[]): Nodes[] {
    const toFilter = nodes.filter((n) => n.parent === node.id);
    return [
      node,
      ...nodes.filter((n) => n.parent === node.id),
      ...toFilter,
      ...toFilter.flatMap((n) => this._arrangeNodes(n, nodes)),
    ];
  }

  async updateWorkflow(
    id: string,
    organizationId: string,
    data: UpdateWorkflow,
  ) {
    const nodes = this._arrangeNodes(
      data.nodes.find((p) => !p.parent)!,
      data.nodes,
    );

    await this._workflows.model.workflows.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        name: data.name,
        active: data.active,
      },
    });

    for (const node of nodes) {
      await this._workflowNodes.model.workflowNodes.upsert({
        where: {
          id_organizationId_workflowId: {
            id: node.id,
            organizationId,
            workflowId: id,
          },
        },
        create: {
          id: node.id,
          organizationId,
          workflowId: id,
          parentId: node.parent || null,
          type: node.type,
          position: node.position,
          data: JSON.stringify(node.data),
        },
        update: {
          parentId: node.parent || null,
          type: node.type,
          position: node.position,
          data: JSON.stringify(node.data),
        },
      });
    }

    const toDelete = await this._workflowNodes.model.workflowNodes.findMany({
      where: {
        organizationId,
        workflowId: id,
        deletedAt: null,
        id: {
          notIn: nodes.map((n) => n.id),
        },
      },
      select: {
        id: true,
      },
    });

    if (toDelete.length > 0) {
      await this._workflowNodes.model.workflowNodes.updateMany({
        where: {
          id: {
            in: toDelete.map((n) => n.id),
          },
        },
        data: {
          parentId: null,
          deletedAt: new Date(),
        },
      });
    }

    return { toDelete, inserted: true };
  }

  async deleteWorkflow(id: string, organizationId: string) {
    return this._workflows.model.workflows.updateMany({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });
  }

  async getWorkflowsCount(organizationId: string) {
    return this._workflows.model.workflows.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  async getActiveWorkflowsCount(organizationId: string) {
    return this._workflows.model.workflows.count({
      where: {
        organizationId,
        active: true,
        deletedAt: null,
      },
    });
  }

  async changeWorkflowActivity(
    workflowId: string,
    organizationId: string,
    active: boolean,
  ) {
    return this._workflows.model.workflows.update({
      where: {
        id: workflowId,
        organizationId,
        deletedAt: null,
      },
      data: {
        active,
      },
    });
  }
}
