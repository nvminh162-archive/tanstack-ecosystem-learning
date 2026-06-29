"use client";

import { useState } from "react";
import { postsService } from "@/services/posts";

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function submitPost() {
    setIsPending(true);
    setIsSuccess(false);
    try {
      const data = await postsService.create({ title, body: "Nội dung bài viết" });
      console.log("Tạo thành công, ID mới là:", data.id);
      setIsSuccess(true);
      setTitle("");
    } catch (error) {
      console.error("Lỗi:", (error as Error).message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="form-card">
      <p className="form-card-title">Viết bài mới</p>
      <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) submitPost(); }}>
        <div className="form-row">
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết..."
          />
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
        {isSuccess && <p className="form-success">✓ Đăng bài thành công!</p>}
      </form>
    </div>
  );
}
