"use client";
import { useState, useEffect } from "react";
import { Post, postsService } from "@/services/posts";
import { PostCards } from "./PostCards";
import { SkeletonCards } from "./SkeletonCard";

export function PaginationPostList() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Post[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    postsService
      .getByPage(page)
      .then((data) => {
        setData(data?.data);
        setHasNextPage(data?.hasNextPage);
      })
      .finally(() => {
        setIsPending(false);
        setIsFetching(false);
      });
  }, [page]);

  if (isPending) {
    return <SkeletonCards />;
  }

  return (
    <div>
      <div
        className={`transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}
      >
        <PostCards posts={data} />
      </div>

      <div className="pagination">
        <button
          className="btn-ghost"
          onClick={() => {
            setPage((p) => Math.max(1, p - 1));
            setIsFetching(true);
          }}
          disabled={page === 1}
        >
          ← Trước
        </button>
        <span className="page-indicator">Trang {page}</span>
        {isFetching && <span className="fetching-badge">Đang tải...</span>}
        <button
          className="btn-ghost"
          onClick={() => {
            setPage((p) => p + 1);
            setIsFetching(true);
          }}
          disabled={!hasNextPage || isFetching}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
