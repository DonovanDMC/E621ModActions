#!/usr/bin/env node
import E621ModActions, { ActionTypes } from "../dist/index.js";
import { nestedJSONToSnakeCase } from "../dist/util.js";
import { program } from "commander";
import { AsyncParser } from "@json2csv/node";
import { stringQuoteOnlyIfNecessary } from "@json2csv/formatters";
import { inspect } from "util";
process.removeAllListeners("warning"); // global fetch is "experimental", and this warning messes with cli scripts

program
    .option("-u, --username [username]", "Your E621 username")
    .option("-k, --apikey [apikey]", "Your E621 API key")
    .option("-b, --base-url [url]", "The base url for requests")
    .option("--disable-title-check", "Disable checking title elements for maintenance and other issues")
    .option("-a, --action [action_type]", "The action to search for (e.g. nuke_tag)")
    .option("-l, --limit [limit]", "The maximum number of actions to return (default: 75, max: 320")
    .option("-p, --page [page]", "The page of results to return (max numbered: 750, supports a/b syntax)")
    .option("--use-legacy-actions", "Use legacy actions (i.e. created_negative_record instead of user_feedback_create)")
    .option("-f, --format [format]", "The format to output results in (default: json, possible: json, json-formatted, json-pretty, csv, csv-split)", "json")
    .option("--debug", "Enable debug logging");

await program.parseAsync();


const options = program.opts();
if(!["json", "json-formatted", "json-pretty", "csv", "csv-split"].includes(options.format)) {
    console.error(`Invalid format "${options.format}"`);
    process.exit(1);
}
if(options.debug) {
    const { default: debug } = await import("debug");
    debug.enable("e621:mod-actions*");
    debug("e621:mod-actions")("Options:", options);
}
let type;
if(options.action !== undefined) {
    const t = options.action.toUpperCase().replace(/\s/g, "_");
    type = ActionTypes[t];
    if(type === undefined) {
        console.error(`Invalid action type "${t}"`);
        process.exit(1);
    }
}
const e6ModActions = new E621ModActions({
    authUser: options.username,
    authKey: options.apikey,
    baseURL: options.baseUrl,
    disableTitleCheck: options.disableTitleCheck
});
const results = await e6ModActions.search({
    action: type,
    limit: options.limit,
    page: options.page
}, options.useLegacyActions);

switch(options.format) {
    case "json": {
        process.stdout.write(JSON.stringify(results));
        process.exit(0);
    }

    case "json-formatted": {
        process.stdout.write(JSON.stringify(results, null, 2));
        process.exit(0);
    }

    case "json-pretty": {
        process.stdout.write(inspect(results, { depth: null, colors: true }));
        process.exit(0);
    }

    case "csv": {
        // collect the keys to ensure nothing is left out, and ensure type is at the start
        const keys = new Set(["type"]);
        const res = results.map(r => {
            const obj = nestedJSONToSnakeCase(r);
            for(const key in obj) {
                keys.add(key);
            }
            return obj;
        });
        const parser = new AsyncParser({
            formatters: {
                string: stringQuoteOnlyIfNecessary()
            },
            fields: Array.from(keys.values())
        });
        const csv = await parser.parse(res).promise();
        process.stdout.write(csv);
        process.exit(0);
    }

    case "csv-split": {
        const parser = new AsyncParser({
            formatters: {
                string: stringQuoteOnlyIfNecessary()
            }
        });
        const byType = {};
        for(const result of results) {
            if(byType[result.type] === undefined) {
                byType[result.type] = [];
            }
            // relocate type to start
            byType[result.type].push(Object.assign({ type: undefined }, nestedJSONToSnakeCase(result)));
        }
        for(const type in byType) {
            const csv = await parser.parse(byType[type]).promise();
            process.stdout.write(`\n--${type}--\n`)
            process.stdout.write(csv);
        }
        process.exit(0);
    }
}
