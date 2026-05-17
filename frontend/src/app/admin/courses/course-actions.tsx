"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleFeatured } from "./actions";
import { Star } from "lucide-react";

interface CourseActionsProps {
  courseId: string;
  featured: boolean;
}

export function CourseActions({ courseId, featured }: CourseActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleFeatured(courseId);
        toast.success(featured ? "Unfeatured course" : "Featured course");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to toggle feature"
        );
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-1.5 rounded-md transition-colors ${
        featured
          ? "text-yellow-500 hover:bg-yellow-50"
          : "text-zinc-300 hover:bg-zinc-100"
      }`}
      title={featured ? "Unfeature course" : "Feature course"}
    >
      <Star className="w-4 h-4" fill={featured ? "currentColor" : "none"} />
    </button>
  );
}
