import { PostList } from "./PostList";

const TAGS = [
  "useEffect",
  "useState",
  "Next.js",
  "React",
  "TypeScript",
  "Fetch API",
];

export function Sidebar() {
  return (
    <aside className="sidebar-stack">
      <div className="sidebar-widget">
        <h3 className="sidebar-widget-title">Bài viết gần đây</h3>
        <PostList limit={5} />
      </div>

      <div className="sidebar-widget">
        <h3 className="sidebar-widget-title">Chủ đề</h3>
        <div className="tag-list">
          {TAGS.map((tag) => (
            <span key={tag} className="tag-badge">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
