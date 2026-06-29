import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/posts/[id] — Lấy chi tiết bài viết
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const id = parseInt(params.id);
  const post = globalThis.dbPosts?.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PATCH /api/posts/[id] — Thay đổi trạng thái thích
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const id = parseInt(params.id);
  const body = await request.json();

  const postIndex = globalThis.dbPosts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
  }

  // Cập nhật cơ sở dữ liệu giả lập
  const post = globalThis.dbPosts[postIndex];
  post.liked = body.liked;
  post.likes = body.liked ? post.likes + 1 : post.likes - 1;

  // Giả lập độ trễ mạng 1 giây
  await new Promise((r) => setTimeout(r, 1000));

  // Cố ý thất bại 25% để minh họa cơ chế rollback
  if (Math.random() > 0.75) {
    // Hoàn tác thay đổi cơ sở dữ liệu giả lập
    post.liked = !body.liked;
    post.likes = !body.liked ? post.likes + 1 : post.likes - 1;

    return NextResponse.json({ error: "Lỗi máy chủ!" }, { status: 500 });
  }

  return NextResponse.json(post);
}
