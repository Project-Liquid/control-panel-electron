import { z } from "zod";

type inputType = "pres" | "temp";

export default interface Layout {
    inputs?: Record<string, { name: string, type: inputType }>,
    valves?: Record<string, string>,
    actions?: Record<string, string>,
    recorder: boolean,
}

export interface LayoutParseResult {
    kind: "success",
    result: Layout,
}

export interface LayoutParseError {
    kind: "syntax" | "validation",
    error: string,
}

const layoutSchema = z.object({
    inputs: z.optional(z.record(z.object({
        name: z.string(),
        type: z.string().refine(s => ["pres", "temp"].indexOf(s) !== -1),
    }))),
    valves: z.optional(z.record(z.string())),
    actions: z.optional(z.record(z.string())),
    recorder: z.optional(z.boolean()).transform(x => x === undefined ? true : x),
}).strict();

export function JSONToLayout(input: string): LayoutParseResult | LayoutParseError {
    let result: object;
    try {
        result = JSON.parse(input);
    } catch (e: unknown) {
        return { kind: "syntax", error: e ? e.toString() : "unknown error" };
    }
    const validated = layoutSchema.safeParse(result);
    if (validated.success) {
        return {
            kind: "success",
            result: validated.data as Layout,
        };
    }
    console.log(validated);
    return {
        kind: "validation",
        error: validated.error.format()._errors.join("\n"),
    };
}