"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserRole, deleteUser } from "./actions";
import { Trash2 } from "lucide-react";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  currentUserId?: string;
}

export function UserActions({ userId, currentRole, currentUserId }: UserActionsProps) {
  const [isPendingRole, startRoleTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const isSelf = userId === currentUserId;

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    startRoleTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        toast.success("Role updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update role");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    startDeleteTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success("User deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete user");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole}
        onChange={handleRoleChange}
        disabled={isPendingRole || isSelf}
        className={`text-xs border border-zinc-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#6c63ff] ${
          isSelf ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <option value="STUDENT">Student</option>
        <option value="INSTRUCTOR">Instructor</option>
        <option value="ADMIN">Admin</option>
      </select>

      <button
        onClick={handleDelete}
        disabled={isPendingDelete || isSelf}
        className={`p-1.5 rounded-md transition-colors ${
          isSelf
            ? "text-zinc-300 cursor-not-allowed"
            : "text-red-500 hover:bg-red-50"
        }`}
        title={isSelf ? "Cannot delete yourself" : "Delete user"}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
