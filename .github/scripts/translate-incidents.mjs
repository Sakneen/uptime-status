// Auto-translates English-only incident entries to Arabic via the Claude API.
// Runs in the Translate Incidents workflow; needs ANTHROPIC_API_KEY.
import fs from "fs";

const INCIDENTS_PATH = "status-page/incidents.json";

const incidents = JSON.parse(fs.readFileSync(INCIDENTS_PATH, "utf8"));
const pending = incidents.filter(
  (incident) =>
    (incident.title?.en && !incident.title?.ar) ||
    (incident.summary?.en && !incident.summary?.ar)
);

if (pending.length === 0) {
  console.log("All incidents already have Arabic text - nothing to translate.");
  process.exit(0);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.log(
    `${pending.length} incident(s) need Arabic, but ANTHROPIC_API_KEY is not configured - skipping. ` +
      "The page shows English for these entries until the secret is added."
  );
  process.exit(0);
}

const { default: Anthropic } = await import("@anthropic-ai/sdk");
const client = new Anthropic();

const example = incidents.find(
  (incident) => incident.title?.en && incident.title?.ar && incident.summary?.ar
);

const TRANSLATION_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Arabic translation of the title" },
    summary: { type: "string", description: "Arabic translation of the summary" },
  },
  required: ["title", "summary"],
  additionalProperties: false,
};

function buildPrompt(incident) {
  const exampleBlock = example
    ? `Match the tone and conventions of this existing entry from the same page:
EN title: ${example.title.en}
AR title: ${example.title.ar}
EN summary: ${example.summary.en}
AR summary: ${example.summary.ar}

`
    : "";

  return `Translate this incident notice for Sakneen's client-facing status page from English to Arabic.

Rules:
- Modern Standard Arabic, formal but plain - written for real-estate developer clients, not engineers.
- Use Arabic-Indic numerals for clock times and durations, and the pattern "بتوقيت UTC" for UTC times.
- Keep product and brand names (Vercel, GitHub, Cloud Run), "HTTP", and status codes in Latin script.

${exampleBlock}English source:
Title: ${incident.title.en}
Summary: ${incident.summary.en}

Return the ARABIC translations in the JSON fields. Never return the English text.`;
}

const ARABIC_CHARACTERS = /[؀-ۿ]/;

let translatedCount = 0;

for (const incident of pending) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2000,
    output_config: {
      format: { type: "json_schema", schema: TRANSLATION_SCHEMA },
    },
    messages: [{ role: "user", content: buildPrompt(incident) }],
  });

  if (response.stop_reason === "refusal") {
    console.log(`Skipped "${incident.id}": request was declined.`);
    continue;
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    console.log(`Skipped "${incident.id}": no text in response.`);
    continue;
  }

  let translated;
  try {
    translated = JSON.parse(textBlock.text);
  } catch {
    console.log(`Skipped "${incident.id}": response was not valid JSON.`);
    continue;
  }

  if (!ARABIC_CHARACTERS.test(translated.title) || !ARABIC_CHARACTERS.test(translated.summary)) {
    console.log(
      `Skipped "${incident.id}": result contains no Arabic script. Got: ${JSON.stringify(translated)}`
    );
    continue;
  }

  if (!incident.title.ar) incident.title.ar = translated.title;
  if (!incident.summary.ar) incident.summary.ar = translated.summary;
  translatedCount += 1;
  console.log(`Translated "${incident.id}": ${translated.title}`);
}

if (translatedCount > 0) {
  fs.writeFileSync(INCIDENTS_PATH, JSON.stringify(incidents, null, 2) + "\n");
  console.log(`Wrote ${translatedCount} translation(s) to ${INCIDENTS_PATH}.`);
} else {
  console.log("No translations were produced.");
}
