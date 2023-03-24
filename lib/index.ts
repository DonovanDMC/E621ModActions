import parse from "./parser.js";
import { LegacyActions, type ActionTypes } from "./Constants.js";
import Debug from "./Debug.js";
import Timer from "./Timer.js";
import { type ActionMap } from "./types.js";
import pkg from "../package.json" assert { type: "json" };
import { JSDOM } from "jsdom";

if (process.env.DISABLE_FETCH_CHECK !== "1") {
    const ver = /^v(?<major>\d+)\.(?<minor>\d+)\.\d+$/.exec(process.version);
    if (ver !== null) {
        const major = Number(ver.groups!.major);
        const minor = Number(ver.groups!.minor);
        if (major < 16 || (major === 16 && minor < 15) || (major === 17 && minor < 5)) {
            throw new Error(`The minimum node version for e621-mod-actions is 16.15.0/17.5.0 with the --experimental-fetch flag, or >=18.0.0. You are currently using ${process.version}.`);
        }

        if (major === 16 || major === 17) {
            const isFlagEnabled = process.execArgv.includes("--experimental-fetch");
            if (!isFlagEnabled) {
                throw new Error("The --experimental-fetch flag is required to use e621-mod-actions in node 16/17. Either enable the flag, or use 18.0.0 or higher.");
            }
        }
    }
}

export interface ClientOptions {
    /** The api key to use for authentication. Api keys made before March 2020 will be 32 characters, keys created afterwards will be 24 characters. This should be paired with `authUser`. Viewing mod actions does not require authentication, but we'll still pass it on anyways. */
    authKey?: string | null;
    /** The username to use for authentication. This should be paired with `authKey`. Viewing mod actions does not require authentication, but we'll still pass it on anyways. */
    authUser?: string | null;
    /**
     * The base URL to use for requests.
     * @defaultValue https://e621.net
     */
    baseURL?: string;
    /**
     * The User-Agent header used within requests. If `authUser` is provided, it will be appended to the end of the default user agent.
     * @defaultValue E621ModActions/${version} (+https://github.com/DonovanDMC/E621ModActions)
     * @defaultValue E621ModActions/${version} (+https://github.com/DonovanDMC/E621ModActions; {user})
     */
    userAgent?: string;
}

export interface SearchOptions<T extends ActionTypes = ActionTypes> {
    /** The type of action to search for. Some may not return any results. */
    action?: T;
    /**
     * The number of results to return per page. The maximum value is 320.
     * @defaultValue 75
     */
    limit?: number;
    /** The page of results to return. */
    page?: number | `${"a" | "b"}${number}`;
}

export default class E621ModActions {
    options: Required<ClientOptions>;
    constructor(options?: ClientOptions) {
        this.options = {
            authKey:   options?.authKey ?? null,
            baseURL:   options?.baseURL ?? "https://e621.net",
            authUser:  options?.authUser ?? null,
            userAgent: options?.userAgent || `E621ModActions/${pkg.version} (+https://github.com/DonovanDMC/E621ModActions${options?.authUser ? `; ${options.authUser}` : ""})`
        };
    }

    private async _request(options?: SearchOptions) {
        const query = new URLSearchParams();
        if (options?.page) {
            query.append("page", options.page.toString());
        }

        if (options?.limit) {
            query.append("limit", options.limit.toString());
        }

        if (options?.action) {
            query.append("search[action]", options.action);
        }
        const qs = query.toString() === "" ? "" : `?${query.toString()}`;
        const auth = this.options.authUser && this.options.authKey ? `Basic ${Buffer.from(`${this.options.authUser}:${this.options.authKey}`).toString("base64")}` : null;
        Debug(`<- GET /mod_actions${qs}`);
        const start = Timer.now();
        const res = await fetch(`https://e621.net/mod_actions${qs}`, {
            headers: {
                "User-Agent": this.options.userAgent,
                ...(auth ? { Authorization: auth } : {})
            }
        });
        Debug(`<- GET /mod_actions${qs} (${Timer.calc(start, Timer.now())})`);

        if (res.status !== 200) {
            throw new Error(`Request failed with status code ${res.status}`);
        }

        const html = (await res.text()).replace(/<br(?: \/)?>/g, "\n");
        // hacky test for maintenance page/getting blocked
        const title = /<title>(?<title>.+)<\/title>/is.exec(html)?.groups?.title.trim().replace(/\r?\n/g, "");
        if (title === undefined || title !== "Mod Actions - e621") {
            throw new Error(`There seems to have been an issue loading the mod actions page. Expected title="Mod Actions - e621", got ${title === undefined ? "none" : `title="${title}"`}`);
        }

        const { window: { document } } = new JSDOM(html);
        return Array.from(document.querySelectorAll<HTMLTableRowElement>("div#c-mod-actions table tbody tr"));
    }

    async search<T extends ActionTypes = ActionTypes>(options?: SearchOptions<T>, useLegacyActions?: boolean) {
        if (options?.action && LegacyActions.includes(options.action) && !useLegacyActions) {
            useLegacyActions = true;
        }
        const elements = await this._request(options);
        return elements.map(element => parse(element, useLegacyActions) as ActionMap[T]);
    }
}

export { ActionTypes, LegacyActions } from "./Constants.js";
export type * from "./types.js";
