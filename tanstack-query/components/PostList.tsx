"use client";

// import { useState, useEffect } from "react";
// import { Post, postsService } from "@/services/posts";
import { usePosts } from "@/hooks/use-posts";
import { SkeletonCards } from "./SkeletonCard";
import { PostCards } from "./PostCards";
import { PaginationPostList } from "./PaginationPostList";

interface Props {
  paginated?: boolean;
  limit?: number;
}

function StaticFeed({ limit }: { limit: number }) {
  // const [data, setData] = useState<Post[]>([]);
  // const [isPending, setIsPending] = useState(true);
  // const [error, setError] = useState<Error | null>(null);

  // useEffect(() => {
  //   postsService
  //     .getAll()
  //     .then((result) => {
  //       setData(result);
  //       setError(null);
  //     })
  //     .catch(setError)
  //     .finally(() => setIsPending(false));
  // }, []);

  const { data, isPending, isError, error } = usePosts();
  // isPending: nếu store rỗng thì sẽ gọi API nạp vào store lần đầu isPending sẽ là true
  // isFetch: nếu mỗi lần queryFn được gọi thì sẽ là true, thường dùng isPending vì nhưng lần fetch dữ liệu mới thì vẫn sử dụng dữ liệu cũ không cần trạng thái skeleten, khi queryFn gọi thì tự đẩy lên UI trải nghiệm tốt hơn

  if (isPending) return <SkeletonCards />;
  if (isError) return <p className="state-error">Lỗi: {error.message}</p>;

  return <PostCards posts={data.slice(0, limit)} />;
}

export function PostList({ paginated = false, limit = 30 }: Props) {
  if (paginated) return <PaginationPostList />;
  return <StaticFeed limit={limit} />;
}
