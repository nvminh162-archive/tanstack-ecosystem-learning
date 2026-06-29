"use client";
import { useState } from "react";
import { PostCards } from "./PostCards";
import { SkeletonCards } from "./SkeletonCard";
import { usePostsPagination } from "@/hooks/use-posts-pagination";

export function PaginationPostList() {
  const [page, setPage] = useState(1);
  const { data, isPending, isPlaceholderData, hasNextPage } = usePostsPagination({ page });

  if (isPending) <SkeletonCards />;

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
