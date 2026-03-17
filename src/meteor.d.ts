/* Global declarations for Meteor runtime environment */
/* These are provided by Meteor at runtime and are not importable */

declare const Meteor: {
    isClient: boolean;
    isServer: boolean;
};

declare const DDPRateLimiter: {
    addRule(matcher: Record<string, unknown>, numRequests: number, timeInterval: number, callback?: (...args: unknown[]) => void): string;
    removeRule(id: string): boolean;
    setErrorMessage(message: string | ((data: { timeToReset: number }) => string)): void;
    setErrorMessageOnRule(ruleId: string, message: string | ((data: { timeToReset: number }) => string)): void;
};
