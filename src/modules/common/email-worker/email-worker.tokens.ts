export const EMAIL_WORKER_TOKENS = {
  DELIVERY_OPTIONS: Symbol('EMAIL_WORKER_TOKENS.DELIVERY_OPTIONS'),
} as const;

export interface EmailDeliveryOptions {
  readonly runAsUser?: string;
  readonly sendmailPath: string;
}
