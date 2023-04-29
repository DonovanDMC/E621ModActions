export function nestedJSONToSnakeCase(this: void, obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null && Object.prototype.toString.call(value) === "[object Object]") {
            const parsed = nestedJSONToSnakeCase(value as Record<string, unknown>);
            for (const [k, v] of Object.entries(parsed)) {
                result[`${key.replace(/([A-Z])/g, "_$1").toLowerCase()}_${k}`] = v;
            }
            continue;
        }

        result[key.replace(/([A-Z])/g, "_$1").toLowerCase()] = value;
    }

    return result;
}
