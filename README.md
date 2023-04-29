# E621 Mod Actions

A parser for https://e621.net/mod_actions. Do note since this is parsing html, issues should be expected. Various things such as some entries not being parsed correctly, entries being categorized as the wrong type, and more. I've made this to the best of my ability. There's some generated documentation [here](https://npm.e621.ws/e621-mod-actions)

### Usage
This module has been built specifically with ES Modules in mind.

```js
import E621ModActions, { ActionTypes } from "e621-mod-actions";

const e6Actions = new E621ModActions();

const actions = await e6Actions.search();

const specificAction = await e6Actions.search({ action: ActionTypes.TAG_ALIAS_CREATE });
```

To use this module inside of a CommonJS project, you will need to use a dynamic import. You can achieve an await within a module by using an IIFE, `process.nextTick`, or some other method which is already async.
```js
(async() => {
    const { default: E621ModActions, ActionTypes } = await import("e621-mod-actions");
})();

process.nextTick(async() => {
    const { default: E621ModActions, ActionTypes } = await import("e621-mod-actions");
});
```

### CLI Usage
This module comes with a cli counterpart to be usable in any language. To use it, install the package globally via `npm i -g e621-mod-actions`, then use `e621-mod-actions --help` to see the usage. The default format is json. You can use the `--format` option to change it to one of the below.
|      Option      |                             Description                             |
|:----------------:|:-------------------------------------------------------------------:|
|      `json`      |                           JSON (Default)                            |
| `json-formatted` |       JSON formatted with `JSON.stringify(results, null, 2)`        |
|  `json-pretty`   |                 JSON formatted with `util.inspect`                  |
|      `csv`       |                    CSV table as one document[^1]                    |
|   `csv-split`    | CSV table with each action type as their own separate table[^1][^2] |
[^1]: Nested JSON properties will be combined into the root with underscores. (e.g. `user.id` -> `user_id`)
[^2]: Tables will be split by a line containing `--[action_type]--` where `[action_type]` is the action type of the following table.

### NodeJS Versions
Only `18.0.0` and above are officially supported, but some lower versions can be used with flags. Other older versions may be usable by providing a fetch pollyfill via `global.fetch` or the `_fetch` option. See below the table for the technical details required for a pollyfill. https://npm.im/node-fetch and https://npm.im/undici have both been tested and seen to work.
| Node Version |                 Info                 |
|:------------:|:------------------------------------:|
|   ^16.15.0   | With the `--experimental-fetch` flag |
|   ^17.5.0    | With the `--experimental-fetch` flag |
|   >=18.0.0   |                                      |

At minimum, a pollyfill fetch must accept `(input: string, init: { headers: Record<string, string>})` and return `{ status: number; statusText: string; text(): Promise<string> }`.
