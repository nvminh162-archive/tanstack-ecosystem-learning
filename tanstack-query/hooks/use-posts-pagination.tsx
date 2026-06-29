import { postsService } from "@/services/posts";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const POSTS_PAGINATION_STALE_TIME = 60 * 1000;

export function usePostsPagination({ page }: { page: number }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["posts", "pagination", page],
    queryFn: () => postsService.getByPage(page),
    placeholderData: keepPreviousData, // Trong lúc chờ dữ liệu load thì dùng keepPreData thay thế (giá trị lần fetch trước placeholder)
    staleTime: POSTS_PAGINATION_STALE_TIME,
  });
  const hasNextPage = query.data?.hasNextPage ?? false;

  // fetch next page
  useEffect(() => {
    if (!hasNextPage) return;
    queryClient.prefetchQuery({
      queryKey: ["posts", "pagination", page + 1],
      queryFn: () => postsService.getByPage(page + 1),
      staleTime: POSTS_PAGINATION_STALE_TIME,
    });
  }, [page, queryClient, hasNextPage]);

  return { ...query, hasNextPage };
}
