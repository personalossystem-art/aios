export interface JwtPayload {
  userId: string;
}

export interface ParsedJob {
  company: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  salaryRange: string;
}

export interface ResumeSuggestions {
  bullets: string[];
}

export type ApplicationStatus =
  | "Applied"
  | "Phone Screen"
  | "Interview"
  | "Offer"
  | "Rejected";
