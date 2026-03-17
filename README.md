<p align="center">
  <h1 align="center">ddp-rate-limiter-mixin</h1>
  <p align="center">
    Declarative rate limiting for Meteor methods — as a <a href="https://github.com/meteor/validated-method">ValidatedMethod</a> mixin.
    <br />
    <i>Rate limiting declaratif pour les methodes Meteor — en tant que mixin <a href="https://github.com/meteor/validated-method">ValidatedMethod</a>.</i>
  </p>
</p>

<p align="center">
  <a href="https://github.com/allohouston/ddp-rate-limiter-mixin/actions/workflows/ci.yml"><img src="https://github.com/allohouston/ddp-rate-limiter-mixin/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/ddp-rate-limiter-mixin"><img src="https://img.shields.io/npm/v/ddp-rate-limiter-mixin.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/ddp-rate-limiter-mixin"><img src="https://img.shields.io/npm/dm/ddp-rate-limiter-mixin.svg" alt="npm downloads" /></a>
  <img src="https://img.shields.io/badge/coverage-100%25-brightgreen" alt="coverage 100%" />
  <img src="https://img.shields.io/badge/meteor-3.4%2B-blue" alt="Meteor 3.4+" />
  <img src="https://img.shields.io/badge/node-%3E%3D20-green" alt="Node >= 20" />
  <a href="https://github.com/allohouston/ddp-rate-limiter-mixin/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/ddp-rate-limiter-mixin.svg" alt="license" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/lint-Biome-60a5fa?logo=biome&logoColor=white" alt="Biome" />
  <img src="https://img.shields.io/badge/test-Vitest-6e9f18?logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/0%20runtime%20deps-brightgreen" alt="zero dependencies" />
</p>

---

## Why? / Pourquoi ?

Meteor's `DDPRateLimiter.addRule()` works, but it creates **side effects** scattered across your codebase. You never know where a limit is defined or what the threshold is.

This mixin lets you declare rate limits **right where you define the method** — explicit, colocated, easy to audit.

*Le `DDPRateLimiter.addRule()` de Meteor fonctionne, mais il cree des **effets de bord** disperses dans le code. On ne sait jamais ou une limite est definie ni quel est le seuil.*

*Ce mixin permet de declarer les limites **directement dans la definition de la methode** — explicite, colocalise, facile a auditer.*

---

## Install / Installation

```bash
meteor add ddp-rate-limiter
npm install ddp-rate-limiter-mixin
```

---

## Quick Start / Demarrage rapide

```typescript
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { RateLimiterMixin } from "ddp-rate-limiter-mixin";

const sendMessage = new ValidatedMethod({
    name: "chat.sendMessage",
    mixins: [RateLimiterMixin],
    rateLimit: {
        numRequests: 5,
        timeInterval: 5000, // 5 requests per 5 seconds
    },
    validate: null,
    async run({ text, channelId }) {
        // your method logic
    },
});
```

That's it. 5 requests per 5 seconds, for all clients, enforced server-side.

*C'est tout. 5 requetes par 5 secondes, pour tous les clients, applique cote serveur.*

---

## Examples / Exemples

### Limit a specific user / Limiter un utilisateur specifique

```typescript
const updateProfile = new ValidatedMethod({
    name: "users.updateProfile",
    mixins: [RateLimiterMixin],
    rateLimit: {
        matcher: { userId: "specificUserId" },
        numRequests: 3,
        timeInterval: 10000,
    },
    // ...
});
```

### Limit with a custom matcher / Limiter avec un matcher personnalise

```typescript
const deletePost = new ValidatedMethod({
    name: "posts.delete",
    mixins: [RateLimiterMixin],
    rateLimit: {
        matcher: {
            userId(userId) {
                // Only rate-limit non-admin users
                return userId !== "adminId";
            },
        },
        numRequests: 2,
        timeInterval: 60000, // 2 deletions per minute
    },
    // ...
});
```

### Custom error message / Message d'erreur personnalise

```typescript
const submitForm = new ValidatedMethod({
    name: "forms.submit",
    mixins: [RateLimiterMixin],
    rateLimit: {
        numRequests: 3,
        timeInterval: 60000,
        errorMessage: (data) =>
            `Too many submissions. Try again in ${Math.ceil(data.timeToReset / 1000)}s.`,
    },
    // ...
});
```

---

## API Reference

### `RateLimiterMixin(methodOptions) → methodOptions`

A mixin function for `ValidatedMethod`. Registers a `DDPRateLimiter.addRule()` on the server and returns the options with an added `rateLimitRuleId`.

On the client, returns `methodOptions` unchanged.

*Fonction mixin pour `ValidatedMethod`. Enregistre une regle `DDPRateLimiter.addRule()` cote serveur et retourne les options avec un `rateLimitRuleId` ajoute.*

*Cote client, retourne `methodOptions` sans modification.*

### `rateLimit` options

| Property | Type | Required | Description (EN) | Description (FR) |
|----------|------|:--------:|------------------|------------------|
| `numRequests` | `number` | **yes** | Max requests per interval (must be >= 1) | Requetes max par intervalle (doit etre >= 1) |
| `timeInterval` | `number` | **yes** | Interval in ms (must be > 0) | Intervalle en ms (doit etre > 0) |
| `matcher` | `object` | no | Filter which requests count | Filtre les requetes a comptabiliser |
| `callback` | `function` | no | Called after rule evaluation | Appelee apres evaluation de la regle |
| `errorMessage` | `string \| function` | no | Custom error when limit exceeded | Message d'erreur quand la limite est atteinte |

### `matcher` properties

All optional. Unspecified fields match all requests. / *Tous optionnels. Les champs absents matchent toutes les requetes.*

| Property | Type | Description |
|----------|------|-------------|
| `userId` | `string \| (id: string) => boolean` | Match by user ID |
| `connectionId` | `string \| (id: string) => boolean` | Match by DDP connection |
| `clientAddress` | `string \| (addr: string) => boolean` | Match by IP address |

> `name` is always the method name, `type` is always `"method"`.

### `callback(reply, ruleInput)`

```typescript
// reply
{
    allowed: boolean;           // was the call allowed?
    timeToReset: number;        // ms until rate limit resets
    numInvocationsLeft: number; // remaining calls in this interval
}

// ruleInput
{
    type: string;           // "method" or "subscription"
    name: string;           // method name
    userId: string;         // user ID
    connectionId: string;   // DDP connection ID
    clientAddress: string;  // client IP
}
```

### `errorMessage`

Custom error message when the rate limit is exceeded. Uses `DDPRateLimiter.setErrorMessageOnRule()` (Meteor 3+). Silently ignored on older Meteor versions.

*Message d'erreur personnalise quand la limite est depassee. Utilise `DDPRateLimiter.setErrorMessageOnRule()` (Meteor 3+). Silencieusement ignore sur les anciennes versions.*

### `rateLimitRuleId`

After the mixin runs, `methodOptions.rateLimitRuleId` contains the rule ID. Use it with `DDPRateLimiter.removeRule()` or `DDPRateLimiter.setErrorMessageOnRule()` if needed.

*Apres execution du mixin, `methodOptions.rateLimitRuleId` contient l'ID de la regle. Utilisable avec `DDPRateLimiter.removeRule()` ou `DDPRateLimiter.setErrorMessageOnRule()`.*

---

## TypeScript

Full type definitions included. / *Definitions de types completes incluses.*

```typescript
import { RateLimiterMixin } from "ddp-rate-limiter-mixin";
import type {
    MethodOptions,
    RateLimitConfig,
    RateLimitMatcher,
    RateLimitReply,
    RateLimitInput,
} from "ddp-rate-limiter-mixin";
```

---

## Migration from v1 / Migration depuis v1

v2 is a **breaking change**: / *v2 est un **breaking change** :*

| Change | v1 | v2 |
|--------|----|----|
| Language | JavaScript (Babel 6) | TypeScript (strict) |
| Module format | CJS only | ESM + CJS (dual) |
| Runtime deps | `babel-runtime` | **0** |
| Mutability | Mutates `methodOptions` | Returns **new object** |
| `rateLimitRuleId` | Not exposed | Exposed in returned options |
| `errorMessage` | Not supported | Supported (string or function) |
| Input validation | Basic type checks | Strict (NaN, Infinity, null, arrays) |
| Node.js | Any | **>= 20** |
| Meteor | 1.x - 2.x | **3.4+** |

---

## Links / Liens

- [Meteor DDPRateLimiter docs](https://docs.meteor.com/api/DDPRateLimiter)
- [mdg:validated-method](https://github.com/meteor/validated-method)
- [npm package](https://www.npmjs.com/package/ddp-rate-limiter-mixin)

## License

[MIT](LICENSE)
