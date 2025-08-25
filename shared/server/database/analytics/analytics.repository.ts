import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@growchief/shared-backend/database/prisma';
import { AnalyticsDto } from '@growchief/shared-both/dto/analytics/analytics.dto';
import dayjs from 'dayjs';

@Injectable()
export class AnalyticsRepository {
  constructor(private _activity: PrismaRepository<'activity'>) {}

  async getAnalytics(organizationId: string, analytics: AnalyticsDto) {
    const start = dayjs.utc(analytics.startDate).startOf('day').toDate();
    const end = dayjs.utc(analytics.endDate).endOf('day').toDate();

    return this._activity.model.activity.groupBy({
      where: {
        organizationId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      by: ['type', 'createdAt'],
      _count: {
        id: true,
      },
    });
  }
}
