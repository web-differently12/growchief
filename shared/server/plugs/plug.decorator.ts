import 'reflect-metadata';

export interface PluginParams {
  identifier: string;
  title: string;
  description: string;
  priority: number;
  randomSelectionChance: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  variables: {
    type: 'input' | 'textarea' | 'number' | 'boolean' | 'select';
    options?: { label: string; value: string }[];
    title: string;
    defaultValue: string;
    id: string;
    placeholder: string;
    regex: RegExp;
  }[];
}

export function Plug(params: PluginParams) {
  return function (target: any, propertyKey: string | symbol, descriptor: any) {
    // Retrieve existing metadata or initialize an empty array
    const existingMetadata = Reflect.getMetadata('custom:plugin', target) || [];

    // Add the metadata information for this method
    existingMetadata.push({ methodName: propertyKey, ...params });

    // Define metadata on the class prototype (so it can be retrieved from the class)
    Reflect.defineMetadata('custom:plugin', existingMetadata, target);
  };
}
