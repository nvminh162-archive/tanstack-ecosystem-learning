"use client";

import { useToggleLike } from "@/hooks/use-toggle-like";
import { Post } from "@/services/posts";

interface Props {
  post: Post;
  inline?: boolean;
}

export function LikeButton({ post, inline = false }: Props) {
  const { mutate, isPending, variables } = useToggleLike(post.id);
  const liked = isPending && variables !== undefined ? variables : post.liked;
  const likes =
    isPending && variables !== undefined
      ? variables
        ? post.likes + 1
        : post.likes
      : post.likes;

  if (inline) {
    return (
      <button
        className={`like-btn ${liked ? "like-btn-active" : ""}`}
        onClick={() => mutate(!liked)}
      >
        {liked ? "♥" : "♡"} {likes}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">{post.title?.slice(0, 50)}</span>
      <button
        className={`like-btn ${liked ? "like-btn-active" : ""}`}
        onClick={() => mutate(!liked)}
      >
        {liked ? "♥" : "♡"} {likes}
      </button>
    </div>
  );
}
