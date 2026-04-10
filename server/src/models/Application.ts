import { Schema, model, Document, Types } from "mongoose";
import type { ApplicationStatus } from "../types";

export interface IApplication extends Document {
  userId: Types.ObjectId;
  company: string;
  role: string;
  status: ApplicationStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["Applied", "Phone Screen", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    jdLink: String,
    notes: String,
    dateApplied: { type: Date, default: Date.now },
    salaryRange: String,
    requiredSkills: { type: [String], default: [] },
    niceToHaveSkills: { type: [String], default: [] },
    seniority: String,
    location: String,
    resumeSuggestions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Application = model<IApplication>("Application", applicationSchema);
