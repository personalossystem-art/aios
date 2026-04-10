import { Response } from "express";
import { Application } from "../models/Application";
import type { AuthRequest } from "../middleware/auth";
import type { ApplicationStatus } from "../types";

export const getApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const apps = await Application.find({ userId: req.userId }).sort({
    createdAt: -1,
  });
  res.json(apps);
};

export const createApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const app = await Application.create({ ...req.body, userId: req.userId });
  res.status(201).json(app);
};

export const updateApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!app) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.json(app);
};

export const deleteApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const app = await Application.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!app) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.status(204).send();
};

export const updateStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { status } = req.body as { status: ApplicationStatus };
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status },
    { new: true }
  );
  if (!app) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.json(app);
};
