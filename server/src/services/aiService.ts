import Groq from "groq-sdk";
import type { ParsedJob, ResumeSuggestions } from "../types";

function getClient() {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function parseJobDescription(jd: string): Promise<ParsedJob> {
  const response = await getClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert job description parser. Extract job details from ANY text — even messy, incomplete, or informal input. Make smart inferences where information is missing.

Return ONLY valid JSON with this exact shape:
{
  "company": string,
  "role": string,
  "requiredSkills": string[],
  "niceToHaveSkills": string[],
  "seniority": string,
  "location": string,
  "salaryRange": string
}

Rules:
- If company is not mentioned, infer from context or use "Not specified"
- If role is not mentioned, infer from skills/context or use "Software Engineer"
- Extract all technical skills mentioned anywhere in the text
- If seniority not mentioned, infer from years of experience or context
- If location not mentioned, use "Remote / Not specified"
- If salary not mentioned, use empty string
- NEVER return null or undefined for any field — always return a string or array`,
      },
      { role: "user", content: jd },
    ],
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("Empty response from Groq");

  const parsed = JSON.parse(raw) as ParsedJob;
  parsed.company = parsed.company || "Not specified";
  parsed.role = parsed.role || "Software Engineer";
  parsed.requiredSkills = parsed.requiredSkills || [];
  parsed.niceToHaveSkills = parsed.niceToHaveSkills || [];
  parsed.seniority = parsed.seniority || "";
  parsed.location = parsed.location || "";
  parsed.salaryRange = parsed.salaryRange || "";
  return parsed;
}

export async function generateResumeBullets(
  parsedJob: ParsedJob
): Promise<ResumeSuggestions> {
  const response = await getClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
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
