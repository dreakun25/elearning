import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/auth";
import { UserActions } from "./user-actions";
import { Search } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  image: string | null;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const currentUserId = session?.user?.id;

  const page = searchParams.page || "1";
  const search = searchParams.search || "";

  const params = new URLSearchParams({ page, limit: "20" });
  if (search) params.set("search", search);

  const res = await apiFetch(`/api/admin/users?${params}`);
  if (!res.ok) {
    return <div className="text-red-500 text-sm">Failed to load users.</div>;
  }

  const data: UsersResponse = await res.json();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-1">Users</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Manage platform users and roles
      </p>

      {/* Search */}
      <form className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6c63ff] bg-white"
        />
      </form>

      {/* Users table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">
                Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">
                Joined
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-zinc-400"
                >
                  No users found.
                </td>
              </tr>
            )}
            {data.users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6c63ff] text-white flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="font-medium text-zinc-800">
                      {user.name || "Unnamed"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "INSTRUCTOR"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserActions
                    userId={user.id}
                    currentRole={user.role}
                    currentUserId={currentUserId}
                  />
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
            {data.pagination.total} users)
          </span>
          <div className="flex gap-2">
            {data.pagination.page > 1 && (
              <a
                href={`/admin/users?page=${data.pagination.page - 1}${search ? `&search=${search}` : ""}`}
                className="px-3 py-1.5 border border-zinc-200 rounded-md text-zinc-600 hover:bg-zinc-50"
              >
                Previous
              </a>
            )}
            {data.pagination.page < data.pagination.totalPages && (
              <a
                href={`/admin/users?page=${data.pagination.page + 1}${search ? `&search=${search}` : ""}`}
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
