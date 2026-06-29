"use client";
import { useState, useEffect } from "react";
import { Post, postsService } from "@/services/posts";
import { PostCards } from "./PostCards";
import { SkeletonCards } from "./SkeletonCard";
import { useQueryClient } from "@tanstack/react-query";
import { usePostsPagination } from "@/hooks/use-posts-pagination";

export function PaginationPostList() {
  const [page, setPage] = useState(1);

  // const [data, setData] = useState<Post[]>([]);
  // const [isPending, setIsPending] = useState(true);
  // const [isFetching, setIsFetching] = useState(false);
  // const [hasNextPage, setHasNextPage] = useState(true);
  const queryClient = useQueryClient();
  const { data, isPending, isPlaceholderData } = usePostsPagination({ page });
  const hasNextPage = data?.hasNextPage ?? false;

  // useEffect(() => {
  //   postsService
  //     .getByPage(page)
  //     .then((data) => {
  //       setData(data?.data);
  //       setHasNextPage(data?.hasNextPage);
  //     })
  //     .finally(() => {
  //       setIsPending(false);
  //       setIsFetching(false);
  //     });
  // }, [page]);
  useEffect(() => {
    if (!hasNextPage) return;
    queryClient.prefetchQuery({
      queryKey: ["posts", "pagination", page + 1],
      queryFn: () => postsService.getByPage(page + 1),
      staleTime: 60 * 1000 // phải giống stale usePostsPagination
    })
  }, [page, queryClient, hasNextPage])

  if (isPending) {
    return <SkeletonCards />;
  }

  return (
    <div>
      <div
        className={`transition-opacity ${isPlaceholderData ? "opacity-50" : "opacity-100"}`}
      >
        <PostCards posts={data?.data ?? []} />
      </div>

      <div className="pagination">
        <button
          className="btn-ghost"
          onClick={() => {
            setPage((p) => Math.max(1, p - 1));
            // setIsFetching(true);
          }}
          disabled={page === 1}
        >
          ← Trước
        </button>
        <span className="page-indicator">Trang {page}</span>
        {isPlaceholderData && <span className="fetching-badge">Đang tải...</span>}
        <button
          className="btn-ghost"
          onClick={() => {
            setPage((p) => p + 1);
            // setIsFetching(true);
          }}
          disabled={!hasNextPage || isPlaceholderData}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
