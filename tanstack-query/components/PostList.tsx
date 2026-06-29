"use client";
import { useState, useEffect } from "react";
import { Post, postsService } from "@/services/posts";
import { SkeletonCards } from "./SkeletonCard";
import { PostCards } from "./PostCards";
import { PaginationPostList } from "./PaginationPostList";

interface Props {
  paginated?: boolean;
  limit?: number;
}

function StaticFeed({ limit }: { limit: number }) {
  const [data, setData] = useState<Post[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    postsService
      .getAll()
      .then((result) => {
        setData(result?.data);
        setError(null);
      })
      .catch(setError)
      .finally(() => setIsPending(false));
  }, []);

  if (isPending) return <SkeletonCards />;
  if (error) return <p className="state-error">Lỗi: {error.message}</p>;

  return <PostCards posts={data.slice(0, limit)} />;
}

export function PostList({ paginated = false, limit = 10 }: Props) {
  if (paginated) return <PaginationPostList />;
  return <StaticFeed limit={limit} />;
}
