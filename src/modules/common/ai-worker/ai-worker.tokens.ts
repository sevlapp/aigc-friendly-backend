export const AI_WORKER_TOKENS = {
  PROVIDER_REGISTRY_OPTIONS: Symbol('AI_WORKER_TOKENS.PROVIDER_REGISTRY_OPTIONS'),
} as const;

export interface AiProviderRegistryOptions {
  readonly providerMode: string;
}
