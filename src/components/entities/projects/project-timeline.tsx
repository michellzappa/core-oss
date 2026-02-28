"use client";

interface ProjectTimelineProps {
  projectId: string;
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  // Timeline not available in core-oss (requires tasks, milestones, interactions entities)
  return null;
}
