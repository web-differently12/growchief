import { providerList } from '@growchief/shared-backend/enrichment/provider.list';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import {
  condition,
  continueAsNew,
  getExternalWorkflowHandle,
  setHandler,
  sleep,
} from '@temporalio/workflow';
import {
  addEnrichment,
  finishedEnrichment,
} from '@growchief/orchestrator/signals/enrichment.signals';
import { makeId } from '@growchief/shared-both/utils/make.id';
import { Mutex } from 'async-mutex';

const enrichmentList = providerList.filter((f) => f.apiKey);

export async function workflowEnrichment({
  queue = [],
  limitsDelay = enrichmentList.map((p) => ({
    name: p.name,
    delay: Date.now(),
  })),
}: {
  queue: Array<
    EnrichmentDto & {
      internalWorkflowId: string;
      platform: string;
      identifier: string;
      testedProviders: string[];
    }
  >;
  limitsDelay: { name: string; delay: number }[];
}) {
  const mutex = new Mutex();

  setHandler(addEnrichment, (item) => {
    mutex.runExclusive(() => {
      queue.push({ ...item, testedProviders: [], identifier: makeId(10) });
    });
  });

  while (true) {
    // wait until something is in the queue
    await condition(() => queue.length > 0);
    const queueLength = queue.length;
    const now = Date.now();

    const availableProviders = limitsDelay.filter((p) => p.delay <= now);

    if (availableProviders.length === 0) {
      await sleep(
        Math.min(...limitsDelay.map((l) => Date.now() - l.delay)) + 1000,
      );
      continue;
    }

    const availableQueues = queue.filter((item) => {
      const notTestedProviders = availableProviders.filter(
        (p) => !item.testedProviders.includes(p.name),
      );
      return notTestedProviders.length > 0;
    });

    if (availableQueues.length === 0) {
      const nextAvailableProvider =
        Math.min(0, ...limitsDelay.map((l) => Date.now() - l.delay)) + 1000;

      await condition(() => queue.length > queueLength, nextAvailableProvider);
      continue;
    }

    const item = availableQueues[0];
    for (const provider of availableProviders
      .map((p) => enrichmentList.find((pl) => pl.name === p.name))
      .filter(Boolean)) {
      const value = await provider?.enrich(item.platform, item);
      if (value && 'url' in value) {
        await getExternalWorkflowHandle(item.internalWorkflowId).signal(
          finishedEnrichment,
          value,
        );
        mutex.runExclusive(() => {
          const itemIndex = queue.findIndex(
            (q) => q.identifier === item.identifier,
          );
          queue.splice(itemIndex, 1);
        });
        break;
      }

      if (!value) {
        item.testedProviders.push(provider!.name);
      }

      if (value && typeof value === 'object' && 'delay' in value) {
        limitsDelay[
          limitsDelay.findIndex((l) => l.name === provider!.name)
        ].delay = Date.now() + (value as { delay: number }).delay;
      }
    }

    await continueAsNew({
      queue,
      limitsDelay,
    });
  }
}
