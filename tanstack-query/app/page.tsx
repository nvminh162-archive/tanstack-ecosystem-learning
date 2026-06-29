import { CreatePostForm } from "@/components/CreatePostForm";
import Header from "@/components/Header";
import { PostList } from "@/components/PostList";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <>
      <Header/>
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
