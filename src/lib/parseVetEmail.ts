import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { VetEmail } from "./gmail";

const RecordSchema = z.object({
  petName: z.string().nullable().describe("The pet's name, or null if not stated."),
  species: z
    .enum(["dog", "cat", "other"])
    .describe("The pet's species; use 'other' if unclear."),
  vaccineName: z
    .string()
    .describe("The vaccine or visit name, e.g. 'Rabies', 'DHPP', 'Annual wellness exam'."),
  description: z
    .string()
    .nullable()
    .describe("A short description of what it covers, or null."),
  administeredDate: z
    .string()
    .nullable()
    .describe("ISO date (YYYY-MM-DD) the dose was given, or null if not stated."),
  nextDueDate: z
    .string()
    .nullable()
    .describe("ISO date (YYYY-MM-DD) the next dose/visit is due, or null if not stated."),
  recurrenceMonths: z
    .number()
    .nullable()
    .describe("Interval between doses in months if stated or clearly implied, else null."),
});

const ExtractionSchema = z.object({
  records: z
    .array(RecordSchema)
    .describe("One entry per vaccine or visit mentioned. Empty if none found."),
});

export type ParsedRecord = z.infer<typeof RecordSchema>;

const SYSTEM_PROMPT = `You extract pet vaccination and vet-visit information from veterinary emails.
Return one record per vaccine or checkup mentioned. Only include real vaccines or visits —
ignore marketing, greetings, and unrelated content. Dates must be ISO format (YYYY-MM-DD).
If a field is not stated in the email, use null rather than guessing.`;

/** Parse a single vet email into structured vaccination records. */
export async function parseVetEmail(email: VetEmail): Promise<ParsedRecord[]> {
  const client = new Anthropic();
  const response = await client.messages.parse({
    // Haiku 4.5 is plenty capable for this structured extraction and ~5x
    // cheaper than Opus. It does not support adaptive thinking, so no
    // `thinking` param here.
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    output_config: { format: zodOutputFormat(ExtractionSchema) },
    messages: [
      {
        role: "user",
        content: `Subject: ${email.subject}\nDate: ${email.date}\n\n${email.body}`,
      },
    ],
  });
  return response.parsed_output?.records ?? [];
}
