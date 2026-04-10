import { Response } from "express";
import { parseJobDescription, generateResumeBullets } from "../services/aiService";
import type { AuthRequest } from "../middleware/auth";

export const parseJD = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { jobDescription } = req.body as { jobDescription: string };
  if (!jobDescription?.trim()) {
    res.status(400).json({ message: "Job description is required" });
    return;
  }
  try {
    const parsed = await parseJobDescription(jobDescription);
    let bullets: string[] = [];
    try {
      const suggestions = await generateResumeBullets(parsed);
      bullets = suggestions.bullets;
    } catch {
      // bullets generation failed silently — parsing still succeeds
    }
    res.json({ parsed, suggestions: bullets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI parsing failed";
    res.status(502).json({ message });
  }
};
