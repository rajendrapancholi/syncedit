import { useQuery } from "@tanstack/react-query";
import { FileNode } from "@/types/file";
import { Project } from "@/features/project/projectType";

interface ProjectResponse {
  project: Project;
  tree: FileNode[];
  accessLevel: "owner" | "edit" | "view";
}

export const useProject = (projectId: string) => {
  return useQuery<ProjectResponse>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(
        `/api/project/get-project/${projectId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (res.status === 401) throw new Error("UNAUTHORIZED");
      if (res.status === 403) throw new Error("FORBIDDEN");
      if (res.status === 404) throw new Error("NOT_FOUND");
      if (!res.ok) throw new Error("Failed to fetch project details");

      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        ["UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND"].includes(error.message)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
};