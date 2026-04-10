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
    const suggestions = await generateResumeBullets(parsed);
    res.json({ parsed, suggestions: suggestions.bullets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI parsing failed";
    res.status(502).json({ message });
  }
};
