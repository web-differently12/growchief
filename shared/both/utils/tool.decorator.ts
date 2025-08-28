import 'reflect-metadata';

export function Tool(params: ToolParams) {
  return function (target: any, propertyKey: string | symbol) {
    // Retrieve existing metadata or initialize an empty array
    const existingMetadata = Reflect.getMetadata('custom:tool', target) || [];

    // Add the metadata information for this method
    existingMetadata.push({ methodName: propertyKey, ...params });

    // Define metadata on the class prototype (so it can be retrieved from the class)
    Reflect.defineMetadata('custom:tool', existingMetadata, target);
  };
}

export interface ToolParams {
  weeklyLimit?: number;
  identifier: string;
  priority: number;
  title: string;
  description: string;
  allowedBeforeIdentifiers: string[];
  notAllowedBeforeIdentifiers: string[];
  notAllowedBeforeIdentifier: string[];
  appendUrl?: string;
  maxChildren?: number;
}
