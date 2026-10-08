import { apiFetch } from "@/lib/api/client";
import type { LearningPathPayload, LearningPathResult } from "@/types/api";

export async function submitLearningPath(
  payload: LearningPathPayload,
): Promise<LearningPathResult> {
  return apiFetch<LearningPathResult>("/ai-path/", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}
