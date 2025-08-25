import { Module } from '@nestjs/common';
import { SharedServerModule } from '@growchief/shared-backend/shared-server.module';
import { getTemporalModule } from '@growchief/shared-backend/temporal/temporal.module';
import { AccountsStepActivity } from '@growchief/orchestrator/activities/accounts.step.activity';
import { GetLeadsDetailsActivity } from '@growchief/orchestrator/activities/get.leads.details.activity';
import { WorkflowInformationActivity } from '@growchief/orchestrator/activities/workflow.information.activity';
import { DeactivateSubscriptionActivity } from '@growchief/orchestrator/activities/deactivate.subscription.activity';
@Module({
  imports: [
    SharedServerModule,
    getTemporalModule(true, require.resolve('./workflows'), [
      AccountsStepActivity,
      GetLeadsDetailsActivity,
      WorkflowInformationActivity,
      DeactivateSubscriptionActivity,
    ]),
  ],
  controllers: [],
  providers: [],
  get exports() {
    return [...this.providers, ...this.imports];
  },
})
export class AppModule {}
