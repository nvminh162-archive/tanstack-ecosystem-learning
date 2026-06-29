"use client";
import { useState } from "react";
import { Post, postsService } from "@/services/posts";

interface Props {
  post: Post;
  inline?: boolean;
}

export function LikeButton({ post, inline = false }: Props) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [isPending, setIsPending] = useState(false);

  async function toggle() {
    if (isPending) return;
    const newLiked = !liked;
    setIsPending(true);
    try {
      await postsService.toggleLike(post.id, newLiked);
      setLiked(newLiked);
      setLikes((l) => (newLiked ? l + 1 : l - 1));
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsPending(false);
    }
  }

  if (inline) {
    return (
      <button
        className={`like-btn ${liked ? "like-btn-active" : ""}`}
        onClick={toggle}
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
        onClick={toggle}
      >
        {liked ? "♥" : "♡"} {likes}
      </button>
    </div>
  );
}
