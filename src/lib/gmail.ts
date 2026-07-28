const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface VetEmail {
  id: string;
  subject: string;
  /** RFC 2822 date header, as sent. */
  date: string;
  /** Decoded plain-text body. */
  body: string;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPart {
  mimeType: string;
  body?: { data?: string };
  parts?: GmailPart[];
}

interface GmailMessage {
  id: string;
  payload: {
    headers: GmailHeader[];
    mimeType: string;
    body?: { data?: string };
    parts?: GmailPart[];
  };
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

/** Depth-first search for the first text/plain part; falls back to text/html. */
function extractBody(part: GmailPart): string {
  if (part.mimeType === "text/plain" && part.body?.data) {
    return decodeBase64Url(part.body.data);
  }
  for (const child of part.parts ?? []) {
    const found = extractBody(child);
    if (found) return found;
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    return decodeBase64Url(part.body.data).replace(/<[^>]+>/g, " ");
  }
  return "";
}

function getHeader(headers: GmailHeader[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

async function gmailFetch<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${GMAIL_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Gmail API error ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetch recent emails from the given sender address.
 * `fromAddress` is matched with Gmail's `from:` search operator.
 */
export async function fetchVetEmails(
  accessToken: string,
  fromAddress: string,
  maxResults = 15,
): Promise<VetEmail[]> {
  const query = encodeURIComponent(`from:${fromAddress}`);
  const list = await gmailFetch<{ messages?: { id: string }[] }>(
    `/messages?q=${query}&maxResults=${maxResults}`,
    accessToken,
  );

  const messages = list.messages ?? [];
  return Promise.all(
    messages.map(async ({ id }) => {
      const message = await gmailFetch<GmailMessage>(
        `/messages/${id}?format=full`,
        accessToken,
      );
      return {
        id: message.id,
        subject: getHeader(message.payload.headers, "Subject"),
        date: getHeader(message.payload.headers, "Date"),
        body: extractBody(message.payload).trim(),
      };
    }),
  );
}
