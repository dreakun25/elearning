import { apiFetch } from "@/lib/api";
import { CourseActions } from "./course-actions";
import { Search } from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  price: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  instructor: { id: string; name: string | null; email: string };
  _count: { lessons: number; enrollments: number; reviews: number };
}

interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default async function AdminCoursesPage(props: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;

  const page = searchParams.page || "1";
  const search = searchParams.search || "";

  const params = new URLSearchParams({ page, limit: "20" });
  if (search) params.set("search", search);

  const res = await apiFetch(`/api/admin/courses?${params}`);
  if (!res.ok) {
    return <div className="text-red-500 text-sm">Failed to load courses.</div>;
  }

  const data: CoursesResponse = await res.json();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-1">Courses</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Manage all courses on the platform
      </p>

      {/* Search */}
      <form className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search courses..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6c63ff] bg-white"
        />
      </form>

      {/* Courses table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">
                Title
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">
                Instructor
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">
                Status
              </th>
              <th className="text-center px-4 py-3 font-medium text-zinc-500">
                Lessons
              </th>
              <th className="text-center px-4 py-3 font-medium text-zinc-500">
                Enrollments
              </th>
              <th className="text-center px-4 py-3 font-medium text-zinc-500">
                Featured
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-500">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {data.courses.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-zinc-400">
                  No courses found.
                </td>
              </tr>
            )}
            {data.courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-zinc-50 hover:bg-zinc-50/50"
              >
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium text-zinc-800">
                      {course.title}
                    </span>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      /{course.slug}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {course.instructor.name || course.instructor.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      course.published
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {course.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-zinc-500">
                  {course._count.lessons}
                </td>
                <td className="px-4 py-3 text-center text-zinc-500">
                  {course._count.enrollments}
                </td>
                <td className="px-4 py-3 text-center">
                  <CourseActions
                    courseId={course.id}
                    featured={course.featured}
                  />
                </td>
                <td className="px-4 py-3 text-right text-zinc-500">
                  {course.price === "0" ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    `$${course.price}`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-zinc-500">
            Page {data.pagination.page} of {data.pagination.totalPages} (
            {data.pagination.total} courses)
          </span>
          <div className="flex gap-2">
            {data.pagination.page > 1 && (
              <a
                href={`/admin/courses?page=${data.pagination.page - 1}${search ? `&search=${search}` : ""}`}
                className="px-3 py-1.5 border border-zinc-200 rounded-md text-zinc-600 hover:bg-zinc-50"
              >
                Previous
              </a>
            )}
            {data.pagination.page < data.pagination.totalPages && (
              <a
                href={`/admin/courses?page=${data.pagination.page + 1}${search ? `&search=${search}` : ""}`}
                className="px-3 py-1.5 border border-zinc-200 rounded-md text-zinc-600 hover:bg-zinc-50"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
