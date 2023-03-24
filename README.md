# E621 Mod Actions

A parser for https://e621.net/mod_actions. Do note since this is parsing html, issues should be expected. Various things such as some entries not being parsed correctly, entries being categorized as the wrong type, and more. I've made this to the best of my ability.

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

### NodeJS Versions
Only `18.0.0` and above are officially supported, but some lower versions can be used with flags.
| Node Version |                 Info                 |
|:------------:|:------------------------------------:|
|   ^16.15.0   | With the `--experimental-fetch` flag |
|    ^17.5.0   | With the `--experimental-fetch` flag |
|   >=18.0.0   |                                      |
