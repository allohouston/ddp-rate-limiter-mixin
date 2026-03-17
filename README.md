# ddp-rate-limiter-mixin

A mixin for [mdg:validated-method](https://github.com/meteor/validated-method) to add rate limitation support to Meteor methods.

**Compatible with Meteor 3.4+** (Node 22, async/await, no Fibers).

## Install

```bash
meteor add ddp-rate-limiter
npm install ddp-rate-limiter-mixin
```

## Usage

```typescript
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { RateLimiterMixin } from "ddp-rate-limiter-mixin";

// Limit to 5 requests per 5 seconds for all clients
const foo = new ValidatedMethod({
    name: "foo",
    mixins: [RateLimiterMixin],
    rateLimit: {
        numRequests: 5,
        timeInterval: 5000,
    },
    validate: null,
    async run() {
        // ...
    },
});

// Limit to 5 requests per 5 seconds for user1 only
const boo = new ValidatedMethod({
    name: "boo",
    mixins: [RateLimiterMixin],
    rateLimit: {
        matcher: {
            userId: "user1",
        },
        numRequests: 5,
        timeInterval: 5000,
    },
    validate: null,
    async run() {
        // ...
    },
});

// Limit to 5 requests per 5 seconds for non-admin users with a custom error message
const bar = new ValidatedMethod({
    name: "bar",
    mixins: [RateLimiterMixin],
    rateLimit: {
        matcher: {
            userId(userId) {
                // In Meteor 3, use findOneAsync in your app code
                // Matcher functions passed to DDPRateLimiter accept sync functions
                return userId !== "adminId";
            },
        },
        numRequests: 5,
        timeInterval: 5000,
        errorMessage: (data) => `Too many requests. Try again in ${Math.ceil(data.timeToReset / 1000)}s.`,
    },
    validate: null,
    async run() {
        // ...
    },
});
```

## API

### `RateLimiterMixin(methodOptions)`

A mixin function for `ValidatedMethod`. It reads the `rateLimit` config from `methodOptions`, registers a rule via `DDPRateLimiter.addRule()`, and returns the options with an added `rateLimitRuleId` property.

On the client, it returns `methodOptions` unchanged (rate limiting is server-only).

### `rateLimit` option

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `numRequests` | `number` | yes | Maximum requests allowed per `timeInterval` |
| `timeInterval` | `number` | yes | Reset interval in milliseconds |
| `matcher` | `object` | no | Filter which requests count towards the limit |
| `callback` | `function` | no | Called after a rule is evaluated |
| `errorMessage` | `string \| function` | no | Custom error message when rate limit is exceeded |

### `matcher` properties

All matcher properties are optional. Unspecified fields default to matching all requests.

| Property | Type | Description |
|----------|------|-------------|
| `userId` | `string \| (userId: string) => boolean` | Match by user ID |
| `connectionId` | `string \| (connectionId: string) => boolean` | Match by DDP connection |
| `clientAddress` | `string \| (clientAddress: string) => boolean` | Match by IP address |

> `name` is always set to the method name and `type` is always `"method"`.

### `callback` parameters

```typescript
callback(reply, ruleInput)
```

- `reply.allowed` — whether the call is allowed
- `reply.timeToReset` — milliseconds until the rate limit resets
- `reply.numInvocationsLeft` — remaining invocations in the current interval
- `ruleInput.type` — `"method"` or `"subscription"`
- `ruleInput.name` — the method name
- `ruleInput.userId` — the user ID
- `ruleInput.connectionId` — the DDP connection ID
- `ruleInput.clientAddress` — the client IP address

### `errorMessage`

Custom error message shown when the rate limit is exceeded. Can be a static string or a function receiving `{ timeToReset }` that returns a string.

Uses `DDPRateLimiter.setErrorMessageOnRule()` (Meteor 3+). On older Meteor versions where this API is unavailable, the option is silently ignored.

### `rateLimitRuleId`

After the mixin runs, `methodOptions.rateLimitRuleId` contains the rule ID returned by `DDPRateLimiter.addRule()`. This can be used with `DDPRateLimiter.removeRule()` or `DDPRateLimiter.setErrorMessageOnRule()` if needed.

## TypeScript

Full type definitions are included. Available types:

```typescript
import type { RateLimitConfig, RateLimitMatcher, MethodOptions, RateLimitReply, RateLimitInput } from "ddp-rate-limiter-mixin";
```

## Migration from v1

v2 is a **breaking change**:

- **ESM by default** — uses `import`/`export` (CJS still available via `require()`)
- **TypeScript** — source rewritten in TypeScript with full type definitions
- **`rateLimitRuleId` exposed** — the mixin now returns a new options object with `rateLimitRuleId` instead of mutating the original
- **`errorMessage` support** — new option to customize the rate limit error message
- **No runtime dependencies** — `babel-runtime` removed
- **Node >= 20** required
- **Immutable** — the mixin no longer mutates `methodOptions`, it returns a new object

## Links

- [Meteor DDPRateLimiter docs](https://docs.meteor.com/api/DDPRateLimiter)
- [mdg:validated-method](https://github.com/meteor/validated-method)

## License

MIT
