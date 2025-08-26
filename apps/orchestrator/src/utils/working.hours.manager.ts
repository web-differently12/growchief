import {
  condition,
  setHandler,
  proxyActivities,
  sleep,
} from '@temporalio/workflow';
import {
  getTimeUntilWorkingHours,
  isWithinWorkingHours,
} from '@growchief/shared-both/utils/time.functions';
import { workingHoursUpdated } from '@growchief/orchestrator/signals/working.hours.signal';
import type { WorkflowInformationActivity } from '@growchief/orchestrator/activities/workflow.information.activity';

const { getWorkingHours } = proxyActivities<WorkflowInformationActivity>({
  startToCloseTimeout: '2 minute',
});

export interface WorkingHoursState {
  workingHours: number[][];
  timezone: number;
}

export class WorkingHoursManager {
  private cachedWorkingHours: WorkingHoursState | null = null;
  private shouldRefetchWorkingHours = true;
  private totalWorkingHoursSleepTime = 0;
  private workingHoursSleepStartTime = 0;

  constructor(private botId: string) {
    this.setupSignalHandler();
  }

  private setupSignalHandler() {
    setHandler(workingHoursUpdated, () => {
      this.shouldRefetchWorkingHours = true;

      // If we're currently sleeping for working hours, recalculate the sleep time
      if (this.workingHoursSleepStartTime > 0) {
        // Remove the old sleep time calculation
        const oldSleepTime = Date.now() - this.workingHoursSleepStartTime;
        this.totalWorkingHoursSleepTime = Math.max(
          0,
          this.totalWorkingHoursSleepTime - oldSleepTime,
        );
        // Reset the start time so it can be recalculated with new working hours
        this.workingHoursSleepStartTime = 0;
      }
    });
  }

  async ensureWithinWorkingHours(): Promise<void> {
    while (true) {
      // Fetch working hours if needed (first time or after update signal)
      if (this.shouldRefetchWorkingHours || !this.cachedWorkingHours) {
        this.cachedWorkingHours = await getWorkingHours(this.botId);
        this.shouldRefetchWorkingHours = false;
      }

      const { workingHours, timezone } = this.cachedWorkingHours;

      // Check if we're within working hours before processing any step
      if (!isWithinWorkingHours(workingHours, timezone)) {
        const sleepTime = getTimeUntilWorkingHours(workingHours, timezone);

        // Track the sleep time before we start sleeping
        const sleepStartTime = Date.now();
        this.workingHoursSleepStartTime = sleepStartTime; // Track for signal handler

        await condition(() => this.shouldRefetchWorkingHours, sleepTime);

        // Calculate actual sleep time (might be less if interrupted by signal)
        const actualSleepTime = Date.now() - sleepStartTime;

        // If working hours were updated during sleep, the signal handler already adjusted totalWorkingHoursSleepTime
        // Only add the sleep time if working hours weren't updated
        if (!this.shouldRefetchWorkingHours) {
          this.totalWorkingHoursSleepTime += actualSleepTime;
        }

        // Reset the sleep start time tracking
        this.workingHoursSleepStartTime = 0;

        // If working hours were updated during sleep, continue the while loop to recheck
        if (this.shouldRefetchWorkingHours) {
          continue; // This continues the while loop
        }
      }

      // If we reach here, we're within working hours and can proceed
      break; // Exit the while loop
    }
  }
}
