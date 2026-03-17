/* Meteor globals mock — injected before each test file */

const addRuleMock = vi.fn(() => "mock-rule-id");
const setErrorMessageOnRuleMock = vi.fn();

(globalThis as Record<string, unknown>).Meteor = {
    isClient: false,
    isServer: true,
};

(globalThis as Record<string, unknown>).DDPRateLimiter = {
    addRule: addRuleMock,
    setErrorMessageOnRule: setErrorMessageOnRuleMock,
};

beforeEach(() => {
    addRuleMock.mockClear();
    setErrorMessageOnRuleMock.mockClear();

    (globalThis as Record<string, unknown>).Meteor = {
        isClient: false,
        isServer: true,
    };

    (globalThis as Record<string, unknown>).DDPRateLimiter = {
        addRule: addRuleMock,
        setErrorMessageOnRule: setErrorMessageOnRuleMock,
    };
});
