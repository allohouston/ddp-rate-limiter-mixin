import type { MethodOptions, RateLimitConfig } from "./types.js";

const isStringOrFunction = (val: unknown): boolean => typeof val === "string" || typeof val === "function";
const isOptionalStringOrFunction = (val: unknown): boolean => isStringOrFunction(val) || typeof val === "undefined";
const isOptionalPlainObject = (val: unknown): boolean =>
    val === undefined || (typeof val === "object" && val !== null && !Array.isArray(val));
const isOptionalFunction = (val: unknown): boolean => typeof val === "function" || typeof val === "undefined";

const alwaysTrue = (): boolean => true;

const validateConfig = (name: string, config: RateLimitConfig): void => {
    const { matcher, numRequests, timeInterval, callback, errorMessage } = config;

    if (typeof numRequests !== "number" || !Number.isFinite(numRequests) || numRequests < 1) {
        throw new Error(`RateLimiterMixin: numRequests must be a positive integer (${name} method)`);
    }

    if (typeof timeInterval !== "number" || !Number.isFinite(timeInterval) || timeInterval <= 0) {
        throw new Error(`RateLimiterMixin: timeInterval must be a positive number (${name} method)`);
    }

    if (!isOptionalPlainObject(matcher)) {
        throw new Error(`RateLimiterMixin: matcher must be an object if specified (${name} method)`);
    }

    if (!isOptionalFunction(callback)) {
        throw new Error(`RateLimiterMixin: callback must be a function if specified (${name} method)`);
    }

    if (errorMessage !== undefined && !isStringOrFunction(errorMessage)) {
        throw new Error(`RateLimiterMixin: errorMessage must be a string or function if specified (${name} method)`);
    }

    const { userId, connectionId, clientAddress } = matcher || {};

    if (!isOptionalStringOrFunction(userId)) {
        throw new Error(`RateLimiterMixin: matcher.userId must be a string or a function if specified (${name} method)`);
    }

    if (!isOptionalStringOrFunction(connectionId)) {
        throw new Error(`RateLimiterMixin: matcher.connectionId must be a string or a function if specified (${name} method)`);
    }

    if (!isOptionalStringOrFunction(clientAddress)) {
        throw new Error(`RateLimiterMixin: matcher.clientAddress must be a string or a function if specified (${name} method)`);
    }
};

export const RateLimiterMixin = (methodOptions: MethodOptions): MethodOptions => {
    if (Meteor.isClient) {
        return methodOptions;
    }

    const { name, rateLimit } = methodOptions;

    if (!rateLimit) {
        throw new Error(`RateLimiterMixin: rateLimit option is missing (${name} method)`);
    }

    validateConfig(name, rateLimit);

    const { matcher, numRequests, timeInterval, callback, errorMessage } = rateLimit;
    const { userId = alwaysTrue, connectionId = alwaysTrue, clientAddress = alwaysTrue } = matcher || {};

    const ruleId = DDPRateLimiter.addRule(
        {
            type: "method",
            name,
            userId,
            connectionId,
            clientAddress,
        },
        numRequests,
        timeInterval,
        callback,
    );

    if (errorMessage !== undefined && typeof DDPRateLimiter.setErrorMessageOnRule === "function") {
        DDPRateLimiter.setErrorMessageOnRule(ruleId, errorMessage);
    }

    return { ...methodOptions, rateLimitRuleId: ruleId };
};
