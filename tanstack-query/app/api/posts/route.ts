import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ===== CƠ SỞ DỮ LIỆU GIẢ LẬP (lưu trong bộ nhớ) =====
// Dùng globalThis để dữ liệu tồn tại qua các lần hot reload của Next.js
declare global {
  var dbPosts: Post[];
}

interface Post {
  id: number;
  title: string;
  body: string;
  liked: boolean;
  likes: number;
}

const initialData: Post[] = Array.from({ length: 30 }).map((_, i) => ({
  id: 30 - i,
  title: `Bài viết mẫu #${30 - i} cho TanStack Query`,
  body: "Nội dung demo",
  liked: false,
  likes: Math.floor(Math.random() * 100),
}));

if (!globalThis.dbPosts) {
  globalThis.dbPosts = initialData;
}

// GET /api/posts — Lấy danh sách bài viết (có phân trang)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const pageStr = searchParams.get("_page") || searchParams.get("page") || "1";
  const limitStr = searchParams.get("_limit") || searchParams.get("limit") || "10";

  const page = parseInt(pageStr);
  const limit = parseInt(limitStr);

  const start = (page - 1) * limit;
  const end = start + limit;

  const total = globalThis.dbPosts.length;

  console.log(`[API] Đang lấy dữ liệu: trang=${page}, giới hạn=${limit}, tổng=${total}`);

  const paginatedPosts = globalThis.dbPosts.slice(start, end);

  // ===== TÍNH hasNextPage =====
  const hasNextPage = end < total;

  // trễ mạng giả lập
  await new Promise((r) => setTimeout(r, 500));

  return NextResponse.json({
    data: paginatedPosts,
    page,
    limit,
    total,
    hasNextPage,
  });
}

// POST /api/posts — Tạo bài viết mới
export async function POST(request: Request) {
  const body = await request.json();

  const newPost: Post = {
    id: Date.now(),
    title: body.title,
    body: body.body || "Nội dung tuyệt vời",
    liked: false,
    likes: 0,
  };

  // Thêm bài viết mới vào đầu danh sách
  globalThis.dbPosts.unshift(newPost);

  // trễ mạng giả lập
  await new Promise((r) => setTimeout(r, 800));

  return NextResponse.json(newPost, { status: 201 });
}
