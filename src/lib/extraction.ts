import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const RecordSchema = z.object({
  petName: z.string().nullable().describe("The pet's name, or null if not stated."),
  species: z
    .enum(["dog", "cat", "other"])
    .describe("The pet's species; use 'other' if unclear."),
  vaccineName: z
    .string()
    .describe("The vaccine, procedure, or visit name, e.g. 'Rabies', 'DHPP', 'Dental cleaning'."),
  description: z
    .string()
    .nullable()
    .describe("A short description of what it is/covers, or null."),
  administeredDate: z
    .string()
    .nullable()
    .describe("ISO date (YYYY-MM-DD) it was performed/given, or null if not stated."),
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
    .describe("One entry per vaccine, procedure, or visit. Empty if none found."),
});

export type ParsedRecord = z.infer<typeof RecordSchema>;

const SYSTEM_PROMPT = `You extract pet vaccination, procedure, and vet-visit information from
veterinary sources (emails or screenshots of a vet records app). Return one record per vaccine,
procedure, or checkup shown. Only include real medical items — ignore marketing, greetings, UI
chrome, and unrelated content. Dates must be ISO format (YYYY-MM-DD). If a field is not present,
use null rather than guessing.`;

/** Run the shared structured extraction over text or image message content. */
export async function extractRecords(
  content: Anthropic.MessageParam["content"],
): Promise<ParsedRecord[]> {
  const client = new Anthropic();
  const response = await client.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    output_config: { format: zodOutputFormat(ExtractionSchema) },
    messages: [{ role: "user", content }],
  });
  return response.parsed_output?.records ?? [];
}
