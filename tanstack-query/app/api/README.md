# Ghi chú về `app/api` trong Next.js

File này giải thích cách thư mục `app/api` đang hoạt động trong project này.

Nếu trước đây bạn chỉ dùng Next.js làm frontend, có thể hiểu ngắn gọn:

- `app/` vẫn là nơi khai báo route của ứng dụng.
- `app/page.tsx` tạo route giao diện, ví dụ `/`.
- `app/api/.../route.ts` tạo backend API endpoint, ví dụ `/api/posts`.
- Mỗi file `route.ts` export các function theo HTTP method: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, ...

## Cấu trúc hiện tại

```txt
app/
  api/
    posts/
      route.ts
      [id]/
        route.ts
```

Cấu trúc trên tạo ra các API endpoint:

```txt
GET   /api/posts
POST  /api/posts
GET   /api/posts/:id
PATCH /api/posts/:id
```

Trong Next.js App Router, tên folder quyết định đường dẫn URL. File xử lý API luôn tên là `route.ts`.

## `app/api/posts/route.ts`

File này tương ứng với endpoint:

```txt
/api/posts
```

Bên trong file có:

```ts
export async function GET(request: Request) {}
export async function POST(request: Request) {}
```

Điều đó nghĩa là cùng một URL `/api/posts`, nhưng mỗi HTTP method sẽ chạy function khác nhau.

### `GET /api/posts`

Dùng để lấy danh sách bài viết.

Ví dụ gọi API:

```ts
fetch("/api/posts");
fetch("/api/posts?page=1&_limit=10");
```

Code hiện tại đọc query string từ URL:

```ts
const { searchParams } = new URL(request.url);
```

Sau đó lấy các giá trị:

```ts
const pageStr = searchParams.get("_page") || searchParams.get("page") || "1";
const limitStr = searchParams.get("_limit") || searchParams.get("limit") || "10";
```

Nghĩa là các URL sau đều hợp lệ:

```txt
/api/posts
/api/posts?page=1
/api/posts?page=2&limit=10
/api/posts?_page=1&_limit=10
```

Response trả về dạng phân trang:

```json
{
  "data": [],
  "page": 1,
  "limit": 10,
  "total": 30,
  "hasNextPage": true
}
```

### `POST /api/posts`

Dùng để tạo bài viết mới.

Ví dụ gọi API:

```ts
fetch("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Bài viết mới",
    body: "Nội dung bài viết",
  }),
});
```

Trong route handler, body được đọc bằng:

```ts
const body = await request.json();
```

Sau đó API tạo object bài viết mới và trả về status `201`:

```ts
return NextResponse.json(newPost, { status: 201 });
```

## `app/api/posts/[id]/route.ts`

Folder `[id]` là dynamic route.

Nó tương ứng với các URL như:

```txt
/api/posts/1
/api/posts/2
/api/posts/123
```

Giá trị trong URL sẽ được truyền vào `params.id`.

Ví dụ:

```txt
/api/posts/123
```

thì:

```ts
params.id === "123"
```

Trong code hiện tại, vì `params.id` là string nên cần đổi sang number:

```ts
const id = parseInt(params.id);
```

### `GET /api/posts/:id`

Dùng để lấy chi tiết một bài viết.

Ví dụ gọi API:

```ts
fetch("/api/posts/1");
```

Nếu tìm thấy bài viết, API trả về:

```json
{
  "id": 1,
  "title": "Bài viết mẫu",
  "body": "Nội dung demo",
  "liked": false,
  "likes": 10
}
```

Nếu không tìm thấy, API trả về status `404`:

```ts
return NextResponse.json(
  { error: "Không tìm thấy bài viết" },
  { status: 404 },
);
```

### `PATCH /api/posts/:id`

Dùng để cập nhật một phần dữ liệu của bài viết.

Trong project này, `PATCH` đang dùng để thay đổi trạng thái like.

Ví dụ gọi API:

```ts
fetch("/api/posts/1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ liked: true }),
});
```

API sẽ:

- tìm bài viết theo `id`
- cập nhật `liked`
- tăng hoặc giảm `likes`
- giả lập delay 1 giây
- cố ý lỗi ngẫu nhiên 25% để demo rollback ở TanStack Query

Phần lỗi ngẫu nhiên này chỉ để học optimistic update:

```ts
if (Math.random() > 0.75) {
  return NextResponse.json({ error: "Lỗi máy chủ!" }, { status: 500 });
}
```

Trong app thật, thường sẽ không cố ý tạo lỗi kiểu này.

## Quy định đặt endpoint trong `app/api`

### 1. Endpoint được tạo từ tên folder

Ví dụ:

```txt
app/api/posts/route.ts
```

tạo endpoint:

```txt
/api/posts
```

Ví dụ khác:

```txt
app/api/users/route.ts
```

tạo endpoint:

```txt
/api/users
```

### 2. Dynamic route dùng dấu ngoặc vuông

Ví dụ:

```txt
app/api/posts/[id]/route.ts
```

tạo endpoint:

```txt
/api/posts/:id
```

Các URL hợp lệ:

```txt
/api/posts/1
/api/posts/abc
/api/posts/anything
```

Nếu muốn nhiều cấp dynamic hơn:

```txt
app/api/users/[userId]/posts/[postId]/route.ts
```

sẽ tạo endpoint:

```txt
/api/users/:userId/posts/:postId
```

### 3. Method được quyết định bởi tên function export

Trong `route.ts`, Next.js sẽ tự tìm function có tên trùng HTTP method.

Ví dụ:

```ts
export async function GET() {}
export async function POST() {}
export async function PATCH() {}
export async function DELETE() {}
```

Khi client gọi:

```txt
GET /api/posts
```

Next.js chạy:

```ts
export async function GET() {}
```

Khi client gọi:

```txt
POST /api/posts
```

Next.js chạy:

```ts
export async function POST() {}
```

Nếu gọi một method chưa được export trong file đó, Next.js sẽ trả về lỗi method không được hỗ trợ.

## Request và Response

### Đọc query params

Query params là phần sau dấu `?`.

Ví dụ:

```txt
/api/posts?page=2&limit=10
```

Đọc trong route handler:

```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
}
```

### Đọc JSON body

Dùng cho `POST`, `PUT`, `PATCH`.

```ts
export async function POST(request: Request) {
  const body = await request.json();
}
```

Client phải gửi header:

```ts
headers: { "Content-Type": "application/json" }
```

### Trả JSON response

Project này dùng:

```ts
import { NextResponse } from "next/server";
```

Trả JSON:

```ts
return NextResponse.json(data);
```

Trả JSON kèm status code:

```ts
return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
```

## Dữ liệu giả lập trong project này

Project này chưa dùng database thật.

Trong `app/api/posts/route.ts`, dữ liệu được lưu tạm trong memory bằng:

```ts
globalThis.dbPosts
```

Lý do dùng `globalThis`:

- dữ liệu tồn tại qua các lần hot reload khi chạy dev server
- đủ tốt để demo TanStack Query
- không cần setup database

Nhưng đây không phải cách lưu dữ liệu cho production.

Trong app thật, phần này thường được thay bằng:

- database như PostgreSQL, MySQL, MongoDB
- ORM như Prisma, Drizzle
- external API
- service riêng bên backend

## `export const dynamic = "force-dynamic"`

Trong các route hiện tại có dòng:

```ts
export const dynamic = "force-dynamic";
```

Dòng này nói với Next.js rằng route này nên chạy động mỗi lần request, thay vì bị tối ưu/cache theo kiểu static.

Vì API này có dữ liệu thay đổi trong memory, dùng `force-dynamic` là hợp lý cho mục đích học.

## Liên hệ với frontend trong project

Frontend không gọi trực tiếp file `route.ts`.

Frontend gọi URL API:

```ts
fetch("/api/posts");
fetch("/api/posts/1");
```

Sau đó Next.js tự map URL đó vào đúng file:

```txt
/api/posts      -> app/api/posts/route.ts
/api/posts/1    -> app/api/posts/[id]/route.ts
```

Trong project này, phần gọi API được gom trong service:

```txt
services/posts.ts
```

Service gọi API thông qua helper:

```txt
utils/request.ts
```

Luồng tổng quát:

```txt
Component
  -> TanStack Query hook
  -> postsService
  -> fetch("/api/posts")
  -> app/api/posts/route.ts
  -> NextResponse.json(...)
  -> UI nhận data và render
```

## Tóm tắt nhanh

- `app/api` là nơi viết backend API trong Next.js App Router.
- Mỗi API endpoint nằm trong một folder và có file `route.ts`.
- Tên folder quyết định URL.
- Tên function export quyết định HTTP method.
- `[id]` nghĩa là dynamic route param.
- `request.json()` dùng để đọc body JSON.
- `new URL(request.url).searchParams` dùng để đọc query params.
- `NextResponse.json()` dùng để trả JSON response.
- `globalThis.dbPosts` trong project này chỉ là database giả lập để học.
