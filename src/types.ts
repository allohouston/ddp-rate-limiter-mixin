export interface RateLimitMatcher {
    userId?: string | ((userId: string) => boolean);
    connectionId?: string | ((connectionId: string) => boolean);
    clientAddress?: string | ((clientAddress: string) => boolean);
}

export interface RateLimitReply {
    allowed: boolean;
    timeToReset: number;
    numInvocationsLeft: number;
}

export interface RateLimitInput {
    type: string;
    name: string;
    userId: string;
    connectionId: string;
    clientAddress: string;
}

export interface RateLimitConfig {
    matcher?: RateLimitMatcher;
    numRequests: number;
    timeInterval: number;
    callback?: (reply: RateLimitReply, input: RateLimitInput) => void;
    errorMessage?: string | ((data: { timeToReset: number }) => string);
}

export interface MethodOptions {
    name: string;
    rateLimit?: RateLimitConfig;
    rateLimitRuleId?: string;
    [key: string]: unknown;
}
