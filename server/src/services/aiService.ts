import Groq from "groq-sdk";
import type { ParsedJob, ResumeSuggestions } from "../types";

const MODEL = "llama-3.1-8b-instant";

function getClient() {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function parseJobDescription(jd: string): Promise<ParsedJob> {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Extract job details from the description and return ONLY valid JSON with this exact shape:
{
  "company": string,
  "role": string,
  "requiredSkills": string[],
  "niceToHaveSkills": string[],
  "seniority": string,
  "location": string,
  "salaryRange": string
}
If salary is not mentioned, return an empty string for salaryRange.`,
      },
      { role: "user", content: jd },
    ],
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("Empty response from Groq");

  const parsed = JSON.parse(raw) as ParsedJob;
  if (!parsed.company || !parsed.role) {
    throw new Error("AI returned incomplete job data");
  }
  return parsed;
}

export async function generateResumeBullets(
  parsedJob: ParsedJob
): Promise<ResumeSuggestions> {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Generate 3-5 strong, specific resume bullet points tailored to the job. Return ONLY valid JSON:
{ "bullets": string[] }
Each bullet must start with an action verb and be specific to the role and required skills.`,
      },
      {
        role: "user",
        content: `Role: ${parsedJob.role} at ${parsedJob.company}
Required skills: ${parsedJob.requiredSkills.join(", ")}
Seniority: ${parsedJob.seniority}`,
      },
    ],
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("Empty response from Groq");

  const result = JSON.parse(raw) as ResumeSuggestions;
  if (!Array.isArray(result.bullets)) throw new Error("Invalid bullets format");
  return result;
}
