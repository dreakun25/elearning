"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function toggleFeatured(courseId: string) {
  const res = await apiFetch(`/api/admin/courses/${courseId}/feature`, {
    method: "PATCH",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to toggle featured status");
  }

  revalidatePath("/admin/courses");
}
