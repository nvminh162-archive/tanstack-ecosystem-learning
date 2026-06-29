import { Post } from "@/services/posts";
import { LikeButton } from "./LikeButton";

export function PostCards({ posts }: { posts: Post[] }) {
  return (
    <div className="post-feed">
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <div className="post-card-meta">
            <span className="post-card-badge">#{post.id}</span>
            <span className="post-card-date">mtikcode</span>
          </div>
          <h2 className="post-card-title">{post.title}</h2>
          <p className="post-card-body">{post.body}</p>
          <div className="post-card-footer">
            <LikeButton post={post} inline />
          </div>
        </article>
      ))}
    </div>
  );
}
