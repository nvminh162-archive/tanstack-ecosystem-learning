import { CreatePostForm } from "@/components/CreatePostForm";
import { PostList } from "@/components/PostList";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <>
      <header className="blog-header">
        <div className="blog-header-inner">
          <span className="blog-logo">
            nvminh162<span className="blog-logo-accent">.id.vn</span>
          </span>
        </div>
      </header>

      <div className="blog-container">
        <div className="blog-grid">
          <main>
            <CreatePostForm />
            <PostList paginated />
          </main>

          <Sidebar />
        </div>
      </div>
    </>
  );
}
