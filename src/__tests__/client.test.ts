import { RateLimiterMixin } from "../rate-limiter.js";

describe("RateLimiterMixin — client side", () => {
    beforeEach(() => {
        (globalThis as Record<string, unknown>).Meteor = {
            isClient: true,
            isServer: false,
        };
    });

    it("returns methodOptions unchanged on client", () => {
        const opts = { name: "clientMethod", rateLimit: { numRequests: 5, timeInterval: 5000 } };
        const result = RateLimiterMixin(opts);

        expect(result).toBe(opts);
    });

    it("does not call DDPRateLimiter.addRule on client", () => {
        RateLimiterMixin({ name: "clientMethod", rateLimit: { numRequests: 5, timeInterval: 5000 } });

        expect(DDPRateLimiter.addRule).not.toHaveBeenCalled();
    });

    it("does not validate rateLimit config on client", () => {
        // Missing rateLimit entirely — should not throw on client
        expect(() => RateLimiterMixin({ name: "clientMethod" })).not.toThrow();
    });
});
