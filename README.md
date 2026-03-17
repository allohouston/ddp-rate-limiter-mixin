<p align="center">
  <h1 align="center">@allohouston/ddp-rate-limiter-mixin</h1>
</p>

<p align="center">
  <a href="https://github.com/allohouston/ddp-rate-limiter-mixin/actions/workflows/ci.yml"><img src="https://github.com/allohouston/ddp-rate-limiter-mixin/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@allohouston/ddp-rate-limiter-mixin"><img src="https://img.shields.io/npm/v/@allohouston/ddp-rate-limiter-mixin" alt="npm version" /></a>
  <a href="https://github.com/allohouston/ddp-rate-limiter-mixin/pkgs/npm/ddp-rate-limiter-mixin"><img src="https://img.shields.io/github/v/release/allohouston/ddp-rate-limiter-mixin?label=github%20packages" alt="GitHub Packages version" /></a>
  <img src="https://img.shields.io/badge/coverage-100%25-brightgreen" alt="coverage 100%" />
  <img src="https://img.shields.io/badge/meteor-3.4%2B-blue" alt="Meteor 3.4+" />
  <img src="https://img.shields.io/badge/node-%3E%3D20-green" alt="Node >= 20" />
  <a href="https://github.com/allohouston/ddp-rate-limiter-mixin/blob/master/LICENSE"><img src="https://img.shields.io/github/license/allohouston/ddp-rate-limiter-mixin" alt="license" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/lint-Biome-60a5fa?logo=biome&logoColor=white" alt="Biome" />
  <img src="https://img.shields.io/badge/test-Vitest-6e9f18?logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/0%20runtime%20deps-brightgreen" alt="zero dependencies" />
</p>

---

<details open>
<summary><b>English</b></summary>

## Why?

Meteor's `DDPRateLimiter.addRule()` works, but it creates **side effects** scattered across your codebase. You never know where a limit is defined or what the threshold is.

This mixin lets you declare rate limits **right where you define the method** — explicit, colocated, easy to audit.

## Install

```bash
meteor add ddp-rate-limiter

# From npmjs.com
npm install @allohouston/ddp-rate-limiter-mixin

# Or from GitHub Packages (add to .npmrc: @allohouston:registry=https://npm.pkg.github.com)
npm install @allohouston/ddp-rate-limiter-mixin --registry=https://npm.pkg.github.com
```

## Quick Start

```typescript
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { RateLimiterMixin } from "@allohouston/ddp-rate-limiter-mixin";

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

## Examples

### Limit a specific user

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

### Custom matcher function

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

### Custom error message

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

## API Reference

### `RateLimiterMixin(methodOptions) → methodOptions`

A mixin function for `ValidatedMethod`. Registers a `DDPRateLimiter.addRule()` on the server and returns the options with an added `rateLimitRuleId`.

On the client, returns `methodOptions` unchanged.

### `rateLimit` options

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `numRequests` | `number` | **yes** | Max requests per interval (must be >= 1) |
| `timeInterval` | `number` | **yes** | Interval in ms (must be > 0) |
| `matcher` | `object` | no | Filter which requests count towards the limit |
| `callback` | `function` | no | Called after rule evaluation |
| `errorMessage` | `string \| function` | no | Custom error when limit is exceeded |

### `matcher` properties

All optional. Unspecified fields match all requests.

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

Custom error message when the rate limit is exceeded. Can be a static string or a function receiving `{ timeToReset }` that returns a string.

Uses `DDPRateLimiter.setErrorMessageOnRule()` (Meteor 3+). Silently ignored on older Meteor versions.

### `rateLimitRuleId`

After the mixin runs, `methodOptions.rateLimitRuleId` contains the rule ID returned by `DDPRateLimiter.addRule()`. Use it with `DDPRateLimiter.removeRule()` or `DDPRateLimiter.setErrorMessageOnRule()` if needed.

## TypeScript

Full type definitions included.

```typescript
import { RateLimiterMixin } from "@allohouston/ddp-rate-limiter-mixin";
import type {
    MethodOptions,
    RateLimitConfig,
    RateLimitMatcher,
    RateLimitReply,
    RateLimitInput,
} from "@allohouston/ddp-rate-limiter-mixin";
```

## Migration from v1

v2 is a **breaking change**:

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

## Links

- [Meteor DDPRateLimiter docs](https://docs.meteor.com/api/DDPRateLimiter)
- [mdg:validated-method](https://github.com/meteor/validated-method)
- [GitHub Packages](https://github.com/allohouston/ddp-rate-limiter-mixin/pkgs/npm/ddp-rate-limiter-mixin)

</details>

---

<details>
<summary><b>Fran&ccedil;ais</b></summary>

## Pourquoi ?

Le `DDPRateLimiter.addRule()` de Meteor fonctionne, mais il cree des **effets de bord** disperses dans le code. On ne sait jamais ou une limite est definie ni quel est le seuil.

Ce mixin permet de declarer les limites **directement dans la definition de la methode** — explicite, colocalise, facile a auditer.

## Installation

```bash
meteor add ddp-rate-limiter

# Depuis npmjs.com
npm install @allohouston/ddp-rate-limiter-mixin

# Ou depuis GitHub Packages (ajouter dans .npmrc : @allohouston:registry=https://npm.pkg.github.com)
npm install @allohouston/ddp-rate-limiter-mixin --registry=https://npm.pkg.github.com
```

## Demarrage rapide

```typescript
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { RateLimiterMixin } from "@allohouston/ddp-rate-limiter-mixin";

const sendMessage = new ValidatedMethod({
    name: "chat.sendMessage",
    mixins: [RateLimiterMixin],
    rateLimit: {
        numRequests: 5,
        timeInterval: 5000, // 5 requetes par 5 secondes
    },
    validate: null,
    async run({ text, channelId }) {
        // votre logique
    },
});
```

C'est tout. 5 requetes par 5 secondes, pour tous les clients, applique cote serveur.

## Exemples

### Limiter un utilisateur specifique

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

### Matcher personnalise

```typescript
const deletePost = new ValidatedMethod({
    name: "posts.delete",
    mixins: [RateLimiterMixin],
    rateLimit: {
        matcher: {
            userId(userId) {
                // Limiter uniquement les utilisateurs non-admin
                return userId !== "adminId";
            },
        },
        numRequests: 2,
        timeInterval: 60000, // 2 suppressions par minute
    },
    // ...
});
```

### Message d'erreur personnalise

```typescript
const submitForm = new ValidatedMethod({
    name: "forms.submit",
    mixins: [RateLimiterMixin],
    rateLimit: {
        numRequests: 3,
        timeInterval: 60000,
        errorMessage: (data) =>
            `Trop de soumissions. Reessayez dans ${Math.ceil(data.timeToReset / 1000)}s.`,
    },
    // ...
});
```

## Reference API

### `RateLimiterMixin(methodOptions) → methodOptions`

Fonction mixin pour `ValidatedMethod`. Enregistre une regle `DDPRateLimiter.addRule()` cote serveur et retourne les options avec un `rateLimitRuleId` ajoute.

Cote client, retourne `methodOptions` sans modification.

### Options `rateLimit`

| Propriete | Type | Requis | Description |
|-----------|------|:------:|-------------|
| `numRequests` | `number` | **oui** | Requetes max par intervalle (doit etre >= 1) |
| `timeInterval` | `number` | **oui** | Intervalle en ms (doit etre > 0) |
| `matcher` | `object` | non | Filtre les requetes a comptabiliser |
| `callback` | `function` | non | Appelee apres evaluation de la regle |
| `errorMessage` | `string \| function` | non | Message d'erreur quand la limite est atteinte |

### Proprietes du `matcher`

Toutes optionnelles. Les champs absents matchent toutes les requetes.

| Propriete | Type | Description |
|-----------|------|-------------|
| `userId` | `string \| (id: string) => boolean` | Filtrer par ID utilisateur |
| `connectionId` | `string \| (id: string) => boolean` | Filtrer par connexion DDP |
| `clientAddress` | `string \| (addr: string) => boolean` | Filtrer par adresse IP |

> `name` est toujours le nom de la methode, `type` est toujours `"method"`.

### `callback(reply, ruleInput)`

```typescript
// reply
{
    allowed: boolean;           // l'appel est-il autorise ?
    timeToReset: number;        // ms avant reinitialisation de la limite
    numInvocationsLeft: number; // appels restants dans l'intervalle
}

// ruleInput
{
    type: string;           // "method" ou "subscription"
    name: string;           // nom de la methode
    userId: string;         // ID utilisateur
    connectionId: string;   // ID de connexion DDP
    clientAddress: string;  // IP du client
}
```

### `errorMessage`

Message d'erreur personnalise quand la limite est depassee. Peut etre une chaine statique ou une fonction recevant `{ timeToReset }` et retournant une chaine.

Utilise `DDPRateLimiter.setErrorMessageOnRule()` (Meteor 3+). Silencieusement ignore sur les anciennes versions de Meteor.

### `rateLimitRuleId`

Apres execution du mixin, `methodOptions.rateLimitRuleId` contient l'ID de la regle retourne par `DDPRateLimiter.addRule()`. Utilisable avec `DDPRateLimiter.removeRule()` ou `DDPRateLimiter.setErrorMessageOnRule()`.

## TypeScript

Definitions de types completes incluses.

```typescript
import { RateLimiterMixin } from "@allohouston/ddp-rate-limiter-mixin";
import type {
    MethodOptions,
    RateLimitConfig,
    RateLimitMatcher,
    RateLimitReply,
    RateLimitInput,
} from "@allohouston/ddp-rate-limiter-mixin";
```

## Migration depuis v1

v2 est un **breaking change** :

| Changement | v1 | v2 |
|------------|----|----|
| Langage | JavaScript (Babel 6) | TypeScript (strict) |
| Format module | CJS uniquement | ESM + CJS (dual) |
| Deps runtime | `babel-runtime` | **0** |
| Mutabilite | Mute `methodOptions` | Retourne un **nouvel objet** |
| `rateLimitRuleId` | Non expose | Expose dans les options retournees |
| `errorMessage` | Non supporte | Supporte (string ou function) |
| Validation | Verification de type basique | Stricte (NaN, Infinity, null, arrays) |
| Node.js | Tout | **>= 20** |
| Meteor | 1.x - 2.x | **3.4+** |

## Liens

- [Documentation DDPRateLimiter Meteor](https://docs.meteor.com/api/DDPRateLimiter)
- [mdg:validated-method](https://github.com/meteor/validated-method)
- [GitHub Packages](https://github.com/allohouston/ddp-rate-limiter-mixin/pkgs/npm/ddp-rate-limiter-mixin)

</details>

---

## License

[MIT](LICENSE)
