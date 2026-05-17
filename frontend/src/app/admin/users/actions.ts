"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, role: string) {
  const res = await apiFetch(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update role");
  }

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const res = await apiFetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete user");
  }

  revalidatePath("/admin/users");
}
