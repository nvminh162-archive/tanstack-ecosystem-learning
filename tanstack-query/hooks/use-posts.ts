import { useQuery } from "@tanstack/react-query";
import { postsService } from "@/services/posts";

export function usePosts() {
  return useQuery({
    queryKey: ["posts", "list"],
    queryFn: () => postsService.getAll(),
    staleTime: 30 * 1000 //60s
  });
}
