import { Injectable } from '@nestjs/common';
import { AnalyticsDto } from '@growchief/shared-both/dto/analytics/analytics.dto';
import { AnalyticsRepository } from '@growchief/shared-backend/database/analytics/analytics.repository';
import { groupBy } from 'lodash';
import { TemporalService } from 'nestjs-temporal-core';
import dayjs from 'dayjs';

async function toArray<T>(it: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of it) out.push(x);
  return out;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private _analyticsRepository: AnalyticsRepository,
    private _temporalService: TemporalService,
  ) {}

  static generateDateSeries(start: string, end: string) {
    const series = [];
    const current = new Date(start);

    while (current <= new Date(end)) {
      series.push(
        // @ts-ignore
        current.toISOString().split('T')[0], // format as YYYY-MM-DD
      );
      current.setDate(current.getDate() + 1); // move to next day
    }

    return series.reduce(
      (acc, date: any) => ({
        ...acc,
        [date]: 0,
      }),
      {},
    );
  }

  async getAnalytics(organizationId: string, analytics: AnalyticsDto) {
    const series = AnalyticsService.generateDateSeries(
      analytics.startDate,
      analytics.endDate,
    );

    const mappedSeries = Object.entries(series).map(([date, total]) => ({
      date,
      total: total as number,
    }));

    const [workflows, graphAnalytics] = await Promise.all([
      this.loadCurrentlyActiveWorkflows(
        organizationId,
        analytics,
        mappedSeries,
      ),
      this.getAnalyticsGraph(organizationId, analytics, series, mappedSeries),
    ]);

    return {
      ...graphAnalytics,
      workflows,
    };
  }

  async loadCurrentlyActiveWorkflows(
    organizationId: string,
    analytics: AnalyticsDto,
    mappedSeries: { date: string; total: number }[] = [],
  ) {
    const start = dayjs.utc(analytics.startDate).startOf('day').toISOString();
    const end = dayjs.utc(analytics.endDate).endOf('day').toISOString();

    const list = await toArray(
      this._temporalService
        .getClient()
        .listWorkflows(
          `organizationId="${organizationId}" AND WorkflowType="workflowBotJobs" AND StartTime >= "${start}" AND StartTime <= "${end}"`,
        ),
    );

    return (
      Object.entries(
        Object.values(
          groupBy(
            [
              ...mappedSeries,
              ...list.map((p) => ({
                total: 1,
                date: p.startTime.toISOString().split('T')[0],
              })),
            ],
            (p) => p.date,
          ),
        ).reduce((acc, value) => {
          const date = value[0].date;
          const total = value.reduce((sum, item) => sum + item.total, 0);
          return {
            ...acc,
            [date]: (acc[date] || 0) + total,
          };
        }, {}),
      )
        .map(([date, total]) => ({
          date,
          total,
        }))
        // @ts-ignore
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    );
  }

  async getAnalyticsGraph(
    organizationId: string,
    analytics: AnalyticsDto,
    series: { [key: string]: number },
    mappedSeries: { date: string; total: number }[] = [],
  ) {
    const analyticsList = await this._analyticsRepository.getAnalytics(
      organizationId,
      analytics,
    );

    return Object.entries(
      groupBy(
        analyticsList.map((p) => ({
          type: p.type,
          date: p.createdAt,
          total: p._count.id,
        })),
        (p) => p.type,
      ),
    ).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: Object.entries(
          value.reduce(
            (sum, item) => ({
              ...sum,
              [item.date.toISOString().split('T')[0]]: item.total,
            }),
            series,
          ),
        )
          .map(([date, total]) => ({
            date,
            total,
          }))
          // @ts-ignore
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      }),
      {
        sendMessage: mappedSeries,
        connectionRequest: mappedSeries,
        completed: mappedSeries,
      },
    );
  }
}
