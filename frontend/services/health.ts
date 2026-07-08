import { apiRequest } from "@/services/api-client";
import type { HealthStatus } from "@/types/api";

export function getHealth(): Promise<HealthStatus> {
  return apiRequest<HealthStatus>("/api/health");
}
