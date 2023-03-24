// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let debug: import("debug").Debug;
try {
    debug = (await import("debug")).default;
} catch {}

/** @hidden */
export default function Debug(name: string, ...extra: Array<unknown>) {
    let first: unknown;
    if (extra.length === 0) {
        first = name;
        name = "";
    }
    if (debug === undefined) {
        return;
    }
    return debug(`e621:mod-actions${name === "" ? "" : `:${name}`}`)(first, ...extra);
}
