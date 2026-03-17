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

describe("RateLimiterMixin — normal behavior", () => {
    it("calls DDPRateLimiter.addRule with correct defaults", () => {
        RateLimiterMixin(baseOptions());

        expect(DDPRateLimiter.addRule).toHaveBeenCalledOnce();

        const [matcher, numRequests, timeInterval] = (DDPRateLimiter.addRule as ReturnType<typeof vi.fn>).mock.calls[0];

        expect(matcher.type).toBe("method");
        expect(matcher.name).toBe("testMethod");
        expect(numRequests).toBe(5);
        expect(timeInterval).toBe(5000);

        // Default matcher fields should be functions returning true
        expect(typeof matcher.userId).toBe("function");
        expect(typeof matcher.connectionId).toBe("function");
        expect(typeof matcher.clientAddress).toBe("function");
        expect(matcher.userId()).toBe(true);
        expect(matcher.connectionId()).toBe(true);
        expect(matcher.clientAddress()).toBe(true);
    });

    it("passes matcher functions as-is", () => {
        const userIdFn = (id: string) => id === "admin";
        const connFn = () => false;
        const addrFn = (addr: string) => addr === "127.0.0.1";

        RateLimiterMixin(
            baseOptions({
                rateLimit: {
                    numRequests: 5,
                    timeInterval: 5000,
                    matcher: { userId: userIdFn, connectionId: connFn, clientAddress: addrFn },
                },
            }),
        );

        const [matcher] = (DDPRateLimiter.addRule as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(matcher.userId).toBe(userIdFn);
        expect(matcher.connectionId).toBe(connFn);
        expect(matcher.clientAddress).toBe(addrFn);
    });

    it("passes matcher strings as-is", () => {
        RateLimiterMixin(
            baseOptions({
                rateLimit: {
                    numRequests: 5,
                    timeInterval: 5000,
                    matcher: { userId: "user1", connectionId: "conn1", clientAddress: "127.0.0.1" },
                },
            }),
        );

        const [matcher] = (DDPRateLimiter.addRule as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(matcher.userId).toBe("user1");
        expect(matcher.connectionId).toBe("conn1");
        expect(matcher.clientAddress).toBe("127.0.0.1");
    });

    it("defaults missing matcher fields to alwaysTrue", () => {
        RateLimiterMixin(
            baseOptions({
                rateLimit: {
                    numRequests: 5,
                    timeInterval: 5000,
                    matcher: { userId: "user1" },
                },
            }),
        );

        const [matcher] = (DDPRateLimiter.addRule as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(matcher.userId).toBe("user1");
        expect(typeof matcher.connectionId).toBe("function");
        expect(matcher.connectionId()).toBe(true);
        expect(typeof matcher.clientAddress).toBe("function");
        expect(matcher.clientAddress()).toBe(true);
    });

    it("passes callback as 4th argument to addRule", () => {
        const cb = vi.fn();

        RateLimiterMixin(
            baseOptions({
                rateLimit: { numRequests: 5, timeInterval: 5000, callback: cb },
            }),
        );

        const [, , , callback] = (DDPRateLimiter.addRule as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(callback).toBe(cb);
    });

    it("passes undefined callback when not specified", () => {
        RateLimiterMixin(baseOptions());

        const [, , , callback] = (DDPRateLimiter.addRule as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(callback).toBeUndefined();
    });

    it("returns methodOptions with rateLimitRuleId", () => {
        const opts = baseOptions({ validate: null, run: vi.fn() });
        const result = RateLimiterMixin(opts);

        expect(result.rateLimitRuleId).toBe("mock-rule-id");
        expect(result.name).toBe("testMethod");
        expect(result.validate).toBe(opts.validate);
        expect(result.run).toBe(opts.run);
    });

    it("does not mutate the original methodOptions", () => {
        const opts = baseOptions();
        const original = { ...opts };

        RateLimiterMixin(opts);

        expect(opts).toEqual(original);
        expect(opts).not.toHaveProperty("rateLimitRuleId");
    });
});
