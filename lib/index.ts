/// <reference lib="dom" />
import parse from "./parser.js";
import { LegacyActions, type ActionTypes } from "./Constants.js";
import Debug from "./Debug.js";
import Timer from "./Timer.js";
import type { ActionMap } from "./types.js";
import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";
const { version } = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { version: string; };


const MakeError = (name: string) => class extends Error {
    override name = name;
};

export const NonOKStatusError = MakeError("NonOKStatusError");
export const RateLimitedError = MakeError("RateLimitedError");
export const MaintenanceError = MakeError("MaintenanceError");
export const ParsingError = MakeError("ParsingError");

const RatelimitedContent = "<h1>503 Rate Limited</h1>";
const MaintenanceContent = "<title>e621 Maintenance</title>";
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
     * Skip the checking of recieved <title> elements. This is used to fail early when captchas or the maintenance page is showing. The title, when trimmed is expected to equal "Mod Actions - e621"
     * @defaultValue false
     */
    disableTitleCheck?: boolean;
    /**
     * The User-Agent header used within requests. If `authUser` is provided, it will be appended to the end of the default user agent.
     * @defaultValue E621ModActions/\{version\} (+https://github.com/DonovanDMC/E621ModActions)
     * @defaultValue E621ModActions/\{version\} (+https://github.com/DonovanDMC/E621ModActions; \{user\})
     */
    userAgent?: string;
    /** A [fetch compatible](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html) request handler. See the readme or code for a bare minimum of what needs to be implemented. */
    _fetch?(this: void, input: string, init: { headers: Record<string, string>; }): Promise<{
        status: number;
        statusText: string;
        text(): Promise<string>;
    }>;
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
        if (global.fetch === undefined && options?._fetch === undefined) {
            const ver = /^v(?<major>\d+)\.(?<minor>\d+)\.\d+$/.exec(process.version);
            if (ver !== null) {
                const major = Number(ver.groups!.major);
                const minor = Number(ver.groups!.minor);
                if (major < 16 || (major === 16 && minor < 15) || (major === 17 && minor < 5)) {
                    throw new Error(`This module requires a fetch implementation. Either use NodeJS 16.15.0/17.5.0 with the --experimental-fetch flag, >=18.0.0 (current: ${process.version}). Alternatively, assign a fetch compatible api to global.fetch, or provide the _fetch option.`);
                }

                throw new Error(`This module requires a fetch implementation. Either enable the --experimental-fetch flag, or use NodeJS >=18.0.0 (current: ${process.version}). Alternatively, assign a fetch compatible api to global.fetch, or provide the _fetch option.`);
            }
        }
        this.options = {
            _fetch:            options?._fetch ?? global.fetch,
            authKey:           options?.authKey ?? null,
            baseURL:           options?.baseURL ?? "https://e621.net",
            authUser:          options?.authUser ?? null,
            disableTitleCheck: options?.disableTitleCheck ?? false,
            userAgent:         options?.userAgent || `E621ModActions/${version} (+https://github.com/DonovanDMC/E621ModActions${options?.authUser ? `; ${options.authUser}` : ""})`
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
        const res = await this.options._fetch(`${this.options.baseURL}/mod_actions${qs}`, {
            headers: {
                "User-Agent": this.options.userAgent,
                ...(auth ? { Authorization: auth } : {})
            }
        });
        Debug(`<- GET /mod_actions${qs} (${Timer.calc(start, Timer.now())})`);

        if (res.status !== 200) {
            if (res.status === 503) {
                const html = await res.text();
                if (html.includes(RatelimitedContent)) {
                    throw new RateLimitedError("You are being rate limited. Please wait a few minutes and try again.");
                }

                if (html.includes(MaintenanceContent)) {
                    throw new MaintenanceError("E621 is currently undergoing maintenance. Please try again later.");
                }
            }
            throw new NonOKStatusError(`Request failed with status: ${res.status} ${res.statusText}`);
        }

        const html = (await res.text()).replace(/<br(?: \/)?>/g, "\n");
        if (!this.options.disableTitleCheck) {
            // hacky test for captchas
            const title = /<title>(?<title>.+)<\/title>/is.exec(html)?.groups?.title.trim().replace(/\r?\n/g, "");
            if (title === undefined || title !== "Mod Actions - e621") {
                throw new ParsingError(`There seems to have been an issue loading the mod actions page. Expected title="Mod Actions - e621", got ${title === undefined ? "none" : `title="${title}"`}`);
            }
        }

        try {
            const { window: { document } } = new JSDOM(html);
            return Array.from(document.querySelectorAll<HTMLTableRowElement>("div#c-mod-actions table tbody tr"));
        } catch (err) {
            throw new ParsingError("Parsing the modactions page failed.", { cause: err });
        }
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
