"use client";

import { useToggleLike } from "@/hooks/use-toggle-like";
import { Post } from "@/services/posts";

interface Props {
  post: Post;
}

export function LikeButton({ post }: Props) {
  const { mutate, isPending, variables } = useToggleLike(post.id);
  const liked = isPending && variables !== undefined ? variables : post.liked;
  const likes =
    isPending && variables !== undefined
      ? variables
        ? post.likes + 1
        : post.likes
      : post.likes;

  return (
    <button
      className={`like-btn ${liked ? "like-btn-active" : ""}`}
      onClick={() => mutate(!liked)}
    >
      {liked ? "♥" : "♡"} {likes}
    </button>
  );
}
