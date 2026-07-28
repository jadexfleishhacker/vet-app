import { extractRecords, type ParsedRecord } from "./extraction";

export type ImageMediaType = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

/** Parse a screenshot of a vet records app into structured records. */
export async function parseVetImage(
  base64: string,
  mediaType: ImageMediaType,
): Promise<ParsedRecord[]> {
  return extractRecords([
    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
    {
      type: "text",
      text: "This is a screenshot from a veterinary records app. Extract every vaccination and procedure shown, with the date it was performed and the next due date when visible.",
    },
  ]);
}
