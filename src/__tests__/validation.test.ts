import { RateLimiterMixin } from "../rate-limiter.js";
import type { MethodOptions } from "../types.js";

const baseOptions = (overrides: Partial<MethodOptions> = {}): MethodOptions => ({
    name: "testMethod",
    rateLimit: {
        numRequests: 5,
        timeInterval: 5000,
    },
    ...overrides,
});

describe("RateLimiterMixin — validation", () => {
    it("throws when rateLimit is missing", () => {
        expect(() => RateLimiterMixin({ name: "foo" })).toThrow("rateLimit option is missing (foo method)");
    });

    it("throws when numRequests is not a number", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: "5" as unknown as number, timeInterval: 5000 },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("numRequests must be a positive integer");
    });

    it("throws when numRequests is zero", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 0, timeInterval: 5000 },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("numRequests must be a positive integer");
    });

    it("throws when numRequests is negative", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: -1, timeInterval: 5000 },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("numRequests must be a positive integer");
    });

    it("throws when numRequests is NaN", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: Number.NaN, timeInterval: 5000 },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("numRequests must be a positive integer");
    });

    it("throws when timeInterval is not a number", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: "5000" as unknown as number },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("timeInterval must be a positive number");
    });

    it("throws when timeInterval is zero", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: 0 },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("timeInterval must be a positive number");
    });

    it("throws when timeInterval is negative", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: -100 },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("timeInterval must be a positive number");
    });

    it("throws when timeInterval is Infinity", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: Number.POSITIVE_INFINITY },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("timeInterval must be a positive number");
    });

    it("throws when matcher is not an object", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: 5000, matcher: 42 as unknown as undefined },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("matcher must be an object");
    });

    it("throws when matcher is null", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: 5000, matcher: null as unknown as undefined },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("matcher must be an object");
    });

    it("throws when matcher is an array", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: 5000, matcher: [] as unknown as undefined },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("matcher must be an object");
    });

    it("throws when callback is not a function", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: 5000, callback: "nope" as unknown as undefined },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("callback must be a function");
    });

    it("throws when errorMessage is not a string or function", () => {
        const opts = baseOptions({
            rateLimit: { numRequests: 5, timeInterval: 5000, errorMessage: 123 as unknown as string },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("errorMessage must be a string or function");
    });

    it("throws when matcher.userId is invalid type", () => {
        const opts = baseOptions({
            rateLimit: {
                numRequests: 5,
                timeInterval: 5000,
                matcher: { userId: 42 as unknown as string },
            },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("matcher.userId must be a string or a function");
    });

    it("throws when matcher.connectionId is invalid type", () => {
        const opts = baseOptions({
            rateLimit: {
                numRequests: 5,
                timeInterval: 5000,
                matcher: { connectionId: true as unknown as string },
            },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("matcher.connectionId must be a string or a function");
    });

    it("throws when matcher.clientAddress is invalid type", () => {
        const opts = baseOptions({
            rateLimit: {
                numRequests: 5,
                timeInterval: 5000,
                matcher: { clientAddress: [] as unknown as string },
            },
        });
        expect(() => RateLimiterMixin(opts)).toThrow("matcher.clientAddress must be a string or a function");
    });
});
