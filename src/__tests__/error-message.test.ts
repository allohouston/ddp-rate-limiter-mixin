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

describe("RateLimiterMixin — errorMessage support", () => {
    it("calls setErrorMessageOnRule with string message", () => {
        RateLimiterMixin(
            baseOptions({
                rateLimit: {
                    numRequests: 5,
                    timeInterval: 5000,
                    errorMessage: "Too many requests",
                },
            }),
        );

        expect(DDPRateLimiter.setErrorMessageOnRule).toHaveBeenCalledOnce();
        expect(DDPRateLimiter.setErrorMessageOnRule).toHaveBeenCalledWith("mock-rule-id", "Too many requests");
    });

    it("calls setErrorMessageOnRule with function message", () => {
        const msgFn = (data: { timeToReset: number }) => `Wait ${data.timeToReset}ms`;

        RateLimiterMixin(
            baseOptions({
                rateLimit: {
                    numRequests: 5,
                    timeInterval: 5000,
                    errorMessage: msgFn,
                },
            }),
        );

        expect(DDPRateLimiter.setErrorMessageOnRule).toHaveBeenCalledOnce();
        expect(DDPRateLimiter.setErrorMessageOnRule).toHaveBeenCalledWith("mock-rule-id", msgFn);
    });

    it("does not call setErrorMessageOnRule when errorMessage is absent", () => {
        RateLimiterMixin(baseOptions());

        expect(DDPRateLimiter.setErrorMessageOnRule).not.toHaveBeenCalled();
    });

    it("skips setErrorMessageOnRule gracefully when API is unavailable (Meteor 2)", () => {
        // Simulate Meteor 2 where setErrorMessageOnRule does not exist
        (globalThis as Record<string, unknown>).DDPRateLimiter = {
            addRule: vi.fn(() => "rule-id"),
        };

        expect(() =>
            RateLimiterMixin(
                baseOptions({
                    rateLimit: {
                        numRequests: 5,
                        timeInterval: 5000,
                        errorMessage: "Too many requests",
                    },
                }),
            ),
        ).not.toThrow();
    });
});
