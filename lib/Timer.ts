/** @module Timer */
// https://github.com/UwUCode/Utils/blob/3e41d5bab0/src/Other/Timer.ts
export default class Timer {

    // https://github.com/UwUCode/Utils/blob/10b0159/src/Functions/Time.ts#L11-L86
    private static ms(time: number | bigint) {
        if (typeof time !== "bigint") {
            time = BigInt(Math.floor(time));
        }
        const r = {
            milliseconds: 0n,
            seconds:      0n,
            minutes:      0n,
            hours:        0n
        };
        if (time < 0n) {
            throw new TypeError("Negative time provided.");
        }
        if (time === 0n) {
            return "0 seconds";
        }
        // Number.EPSILON = https://stackoverflow.com/a/11832950
        r.milliseconds = time % 1000n;
        r.hours = time / 3600000n;
        time -= r.hours * 3600000n;
        r.minutes = time / 60000n;
        time -= r.minutes * 60000n;
        r.seconds = time / 1000n;
        time -= r.seconds * 1000n;

        const total = (Object.values(r)).reduce((a, b) => a + b, 0n);
        if (r.milliseconds === total) {
            return `${r.milliseconds}ms`;
        }

        const str: Array<string> = [];
        if (r.seconds > 0) {
            str.push(`${r.seconds}s`);
        }
        if (r.minutes > 0) {
            str.push(`${r.minutes}m`);
        }
        if (r.hours > 0) {
            str.push(`${r.hours}h`);
        }

        return  str.reverse().join(" ");
    }

    static calc(start: bigint, end: bigint, dec = 0) {
        const v = Number(end - start);
        return this.convert(parseFloat((v).toFixed(dec)), "ns", dec);
    }

    // https://github.com/UwUCode/Utils/blob/3e41d5bab0/src/Functions/Time.ts#L103-L119
    static convert(input: number, type: "ms" | "mi" | "ns", dec = 3): string {
        input = parseFloat(input.toFixed(dec));
        switch (type) {
            case "ms": {
                return input < 1000 ? `${input}ms` : this.ms(input);
            }
            case "mi": {
                return input < 1000 ? `${input}µs` : this.convert(input / 1000, "ms", dec);
            }
            case "ns": {
                return input < 1000 ? `${input}ns` : this.convert(input / 1000, "mi", dec);
            }
            default: {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return `${input}${type}`;
            }
        }
    }

    static now() {
        return process.hrtime.bigint();
    }
}
