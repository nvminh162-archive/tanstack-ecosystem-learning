# TanStack Query Tutorial Notes

Project này là bản ôn tập TanStack Query trong Next.js. Mục tiêu chính là thay cách tự quản lý `useEffect`, `useState`, `isLoading`, `error`, cache thủ công bằng TanStack Query.

## Cài Đặt

```bash
npm i @tanstack/react-query
npm i @tanstack/react-query-devtools
```

## TanStack Query Giải Quyết Gì?

Khi gọi API bằng React thuần, ta thường phải tự làm nhiều việc:

- Tạo state `data`
- Tạo state `isPending`
- Tạo state `error`
- Gọi API trong `useEffect`
- Tránh gọi API lặp lại
- Tự cache dữ liệu
- Tự update UI sau khi POST/PATCH/DELETE
- Tự xử lý pagination/loading khi chuyển trang

TanStack Query giúp gom các việc đó vào một hệ thống cache chung gọi là `QueryClient`.

Nói ngắn gọn:

```txt
useQuery    = lấy dữ liệu từ server và cache lại
useMutation = thay đổi dữ liệu trên server
queryClient = điều khiển cache
queryKey    = địa chỉ của dữ liệu trong cache
```

## Cấu Trúc Project

```txt
app/providers.tsx
  Bọc app bằng QueryClientProvider

services/posts.ts
  Chứa các hàm gọi API: getAll, getByPage, create, toggleLike

hooks/use-posts.ts
  Query lấy danh sách post thường

hooks/use-posts-pagination.tsx
  Query lấy post theo trang, keep previous data, prefetch trang tiếp theo

hooks/use-create-posts.ts
  Mutation tạo post mới

hooks/use-toggle-like.ts
  Mutation like/unlike và update cache trực tiếp

components/PostList.tsx
  Render list thường hoặc list phân trang

components/PaginationPostList.tsx
  UI phân trang
```

## QueryClientProvider

File: `app/providers.tsx`

```tsx
const [queryClient] = useState(() => new QueryClient());
```

`QueryClient` là nơi TanStack Query lưu cache. App phải được bọc bởi:

```tsx
<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>
```

Lý do dùng `useState(() => new QueryClient())`: để chỉ tạo một `QueryClient` ổn định cho vòng đời component, không tạo lại mỗi lần render.

## useQuery

File: `hooks/use-posts.ts`

```ts
export function usePosts() {
  return useQuery({
    queryKey: ["posts", "list"],
    queryFn: () => postsService.getAll(),
    staleTime: 30 * 1000,
  });
}
```

`useQuery` dùng cho việc đọc dữ liệu.

Các phần cần nhớ:

- `queryKey`: tên định danh dữ liệu trong cache.
- `queryFn`: hàm thật sự gọi API.
- `staleTime`: thời gian dữ liệu còn được xem là mới.
- `data`: dữ liệu trả về.
- `isPending`: lần đầu query chưa có dữ liệu.
- `isError`: query bị lỗi.
- `error`: object lỗi.

Ví dụ trong `PostList.tsx`:

```tsx
const { data, isPending, isError, error } = usePosts();

if (isPending) return <SkeletonCards />;
if (isError) return <p>Lỗi: {error.message}</p>;

return <PostCards posts={data.slice(0, limit)} />;
```

## queryKey

`queryKey` là địa chỉ cache. Cùng `queryKey` thì dùng chung cache. Khác `queryKey` thì TanStack Query xem là dữ liệu khác.

Ví dụ:

```ts
["posts", "list"]
["posts", "pagination", 1]
["posts", "pagination", 2]
```

Lưu ý quan trọng đã gặp trong project:

```ts
["post", "pagination", page]
["posts", "pagination", page]
```

Hai key này khác nhau vì `post` và `posts` khác chuỗi. Nếu query dùng một key nhưng prefetch dùng key khác, cache sẽ không ăn khớp và request bị lặp.

## staleTime

`staleTime` là thời gian dữ liệu được coi là còn mới.

Ví dụ:

```ts
staleTime: 60 * 1000
```

Trong 60 giây, nếu component mount lại hoặc quay lại trang đã cache, TanStack Query có thể dùng cache thay vì fetch lại ngay.

Nếu không set `staleTime`, mặc định dữ liệu được xem là stale rất nhanh. Điều đó không có nghĩa cache mất, nhưng TanStack Query có thể refetch ở một số thời điểm như mount lại, focus lại tab, reconnect mạng.

## isPending Và isFetching

`isPending` thường dùng cho loading lần đầu, khi chưa có data trong cache.

`isFetching` là trạng thái query đang fetch, kể cả khi đã có data cũ.

Trong UI, thường dùng:

```tsx
if (isPending) return <SkeletonCards />;
```

Vì nếu đã có data cũ rồi, ta không muốn xóa UI để hiện skeleton lại.

## Pagination

File: `hooks/use-posts-pagination.tsx`

```ts
export function usePostsPagination({ page }: { page: number }) {
  const query = useQuery({
    queryKey: ["posts", "pagination", page],
    queryFn: () => postsService.getByPage(page),
    placeholderData: keepPreviousData,
    staleTime: POSTS_PAGINATION_STALE_TIME,
  });

  return { ...query, hasNextPage };
}
```

Mỗi page có cache riêng:

```txt
["posts", "pagination", 1]
["posts", "pagination", 2]
["posts", "pagination", 3]
```

Khi `page` thay đổi, TanStack Query đổi sang cache key tương ứng.

## keepPreviousData Và placeholderData

Trong pagination, nếu chuyển từ page 1 sang page 2 mà chưa có dữ liệu page 2, UI có thể bị trống.

Ta dùng:

```ts
placeholderData: keepPreviousData
```

Ý nghĩa: trong lúc đang fetch page mới, tạm giữ data page cũ trên màn hình. Nhờ vậy UI mượt hơn.

Khi đang dùng data cũ tạm thời, `isPlaceholderData` sẽ là `true`.

Project dùng nó để làm mờ UI:

```tsx
className={`transition-opacity ${isPlaceholderData ? "opacity-50" : "opacity-100"}`}
```

## Prefetch

Prefetch là tải trước dữ liệu có khả năng user sắp cần.

Trong project, khi đang ở page hiện tại, hook tự prefetch page tiếp theo:

```ts
queryClient.prefetchQuery({
  queryKey: ["posts", "pagination", page + 1],
  queryFn: () => postsService.getByPage(page + 1),
  staleTime: POSTS_PAGINATION_STALE_TIME,
});
```

Ví dụ đang ở page 3, nếu còn page sau thì app tải trước page 4. Khi user bấm "Sau", data có thể đã nằm trong cache.

Điểm cần nhớ: `queryKey` của `prefetchQuery` phải giống `queryKey` của `useQuery`.

## useMutation

`useMutation` dùng cho hành động làm thay đổi dữ liệu server:

- POST tạo post
- PATCH like/unlike
- PUT cập nhật
- DELETE xóa

Ví dụ tạo post:

```ts
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => postsService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      console.log("Created ", data.id);
    },
  });
}
```

Các trạng thái mutation hay dùng:

- `mutate`: gọi mutation.
- `isPending`: mutation đang chạy.
- `isSuccess`: mutation thành công.
- `isError`: mutation lỗi.

## invalidateQueries

Sau khi tạo post mới, cache cũ không còn chắc đúng nữa. Cách đơn giản là invalidate:

```ts
queryClient.invalidateQueries({ queryKey: ["posts"] });
```

Ý nghĩa: đánh dấu các query bắt đầu bằng `["posts"]` là cũ và cho phép refetch.

Trong project, câu này ảnh hưởng đến:

```txt
["posts", "list"]
["posts", "pagination", page]
```

Đây là cách dễ hiểu, phù hợp khi tạo mới post vì danh sách có thể thay đổi nhiều.

## setQueryData Và setQueriesData

Với like/unlike, nếu invalidate toàn bộ posts thì hơi phí vì chỉ một post thay đổi.

Project dùng update cache trực tiếp:

```ts
queryClient.setQueryData<Post[]>(
  ["posts", "list"],
  (oldDataCache) => oldDataCache?.map(applyUpdate)
);
```

Với dữ liệu pagination, nhiều page có thể chứa post đó, nên dùng:

```ts
queryClient.setQueriesData<PaginatedPosts>(
  { queryKey: ["posts", "pagination"] },
  (oldDataCache) =>
    oldDataCache && {
      ...oldDataCache,
      data: oldDataCache.data.map(applyUpdate),
    }
);
```

Khác nhau:

```txt
setQueryData    = update đúng một cache key
setQueriesData  = update nhiều cache key khớp prefix/filter
```

## Optimistic UI Nhẹ Trong LikeButton

Trong `LikeButton.tsx`, UI hiển thị trạng thái like mới ngay khi mutation đang chạy:

```ts
const liked = isPending && variables !== undefined ? variables : post.liked;
```

`variables` là giá trị truyền vào `mutate`.

Ví dụ:

```ts
mutate(!liked)
```

Trong lúc request chưa xong, UI vẫn có thể dùng `variables` để hiển thị cảm giác phản hồi ngay.

Đây là một dạng optimistic UI nhẹ. Bản đầy đủ hơn thường dùng `onMutate`, rollback trong `onError`, và sync lại trong `onSettled`.

## Service Layer

File: `services/posts.ts`

Project tách API ra service:

```ts
postsService.getAll()
postsService.getByPage(page)
postsService.create(data)
postsService.toggleLike(id, liked)
```

Lợi ích:

- Component không cần biết URL API.
- Hook chỉ gọi service.
- Dễ sửa API mà không lan ra UI.
- Type trả về rõ ràng hơn.

Ví dụ quan trọng:

```ts
async getAll(): Promise<Post[]> {
  const data = await request(BASE, {
    cache: "no-store",
  });
  return data.data;
}
```

`getAll()` trả thẳng `Post[]`, nên component chỉ cần:

```ts
data.slice(0, limit)
```

Không cần viết:

```ts
data.data.slice(0, limit)
```

## Những Từ Khóa Cần Nhớ

`QueryClient`
: Bộ não/cache store của TanStack Query.

`QueryClientProvider`
: Provider bọc app để các hook query dùng được cache chung.

`useQuery`
: Hook dùng để GET/read data.

`useMutation`
: Hook dùng để POST/PATCH/PUT/DELETE.

`queryKey`
: Địa chỉ cache. Phải ổn định và thống nhất.

`queryFn`
: Hàm gọi API thật.

`staleTime`
: Khoảng thời gian data được xem là mới.

`isPending`
: Loading lần đầu, khi chưa có data.

`isFetching`
: Đang fetch, kể cả khi đã có data.

`placeholderData`
: Data tạm dùng trong lúc chờ data mới.

`keepPreviousData`
: Giữ data cũ khi queryKey đổi, thường dùng cho pagination.

`isPlaceholderData`
: Đang hiển thị data tạm.

`prefetchQuery`
: Tải trước data vào cache.

`invalidateQueries`
: Đánh dấu cache cũ để refetch.

`setQueryData`
: Sửa trực tiếp một cache entry.

`setQueriesData`
: Sửa nhiều cache entry cùng lúc.

`mutate`
: Hàm chạy mutation.

`variables`
: Tham số truyền vào mutation hiện tại.

## Luồng Dữ Liệu Trong Project

List thường:

```txt
PostList
  -> usePosts
    -> postsService.getAll
      -> GET /api/posts
    -> cache ["posts", "list"]
```

Pagination:

```txt
PaginationPostList
  -> usePostsPagination({ page })
    -> postsService.getByPage(page)
      -> GET /api/posts?page=...&_limit=10
    -> cache ["posts", "pagination", page]
    -> prefetch ["posts", "pagination", page + 1]
```

Create post:

```txt
CreatePostForm
  -> useCreatePost
    -> postsService.create
      -> POST /api/posts
    -> invalidate ["posts"]
    -> list/pagination refetch khi cần
```

Like post:

```txt
LikeButton
  -> useToggleLike(post.id)
    -> postsService.toggleLike
      -> PATCH /api/posts/:id
    -> setQueryData ["posts", "list"]
    -> setQueriesData ["posts", "pagination"]
```

## Những Chỗ Dễ Nhầm

### 1. Cache rồi mà vẫn bị request lại

Các nguyên nhân thường gặp:

- `queryKey` không giống nhau giữa `useQuery` và `prefetchQuery`.
- `staleTime` quá thấp hoặc không có.
- Component unmount/mount lại và data đã stale.
- Dev mode của React/Next có thể làm một số logic chạy lại trong quá trình phát triển.
- `invalidateQueries` được gọi sau mutation.

### 2. `data.data` hay `data`

Tùy service trả gì.

Nếu service trả raw response:

```ts
Promise<PaginatedPosts>
```

thì component phải dùng:

```ts
data.data
```

Nếu service đã bóc sẵn:

```ts
Promise<Post[]>
```

thì component dùng:

```ts
data
```

Project hiện tại chọn cách `getAll()` trả `Post[]` cho list thường.

### 3. Khi nào invalidate, khi nào set cache trực tiếp?

Dùng `invalidateQueries` khi:

- Dữ liệu thay đổi rộng.
- Không chắc cache nào bị ảnh hưởng.
- Muốn đơn giản, dễ đúng.

Dùng `setQueryData` hoặc `setQueriesData` khi:

- Biết chính xác dữ liệu nào thay đổi.
- Muốn tránh fetch lại.
- Muốn UI cập nhật nhanh hơn.

Trong project:

- Create post: dùng `invalidateQueries`.
- Like/unlike: dùng `setQueryData` và `setQueriesData`.

## Checklist Khi Debug TanStack Query

- Query key có thống nhất không?
- `queryFn` có trả đúng type component cần không?
- Service trả `Post[]` hay `{ data: Post[] }`?
- Có `staleTime` chưa?
- Có mutation nào đang `invalidateQueries` không?
- Có đang prefetch bằng key khác key query thật không?
- Component có còn `useEffect` fetch thủ công song song với `useQuery` không?
- Có đang chạy dev mode nên thấy request nhiều hơn production không?
- DevTools của TanStack Query hiển thị cache key nào?

## Câu Hỏi Phỏng Vấn TanStack Query

1. TanStack Query giải quyết vấn đề gì trong React app?
2. `useQuery` khác gì với `useMutation`?
3. `queryKey` dùng để làm gì? Vì sao query key phải ổn định?
4. Nếu hai query có cùng `queryKey` thì chuyện gì xảy ra?
5. `staleTime` là gì? Khác gì với cache còn tồn tại?
6. Vì sao data đã cache nhưng app vẫn có thể refetch?
7. `isPending` khác gì `isFetching`?
8. Khi nào nên dùng `placeholderData: keepPreviousData`?
9. `isPlaceholderData` có ý nghĩa gì trong pagination?
10. `prefetchQuery` dùng để làm gì?
11. Vì sao `prefetchQuery` phải dùng cùng `queryKey` với `useQuery`?
12. `invalidateQueries` hoạt động như thế nào?
13. `invalidateQueries({ queryKey: ["posts"] })` ảnh hưởng đến những query nào?
14. `setQueryData` khác gì `setQueriesData`?
15. Khi like một post, nên invalidate toàn bộ list hay update cache trực tiếp? Vì sao?
16. Optimistic update là gì?
17. Trong mutation, `onSuccess`, `onError`, `onSettled` khác nhau thế nào?
18. `variables` trong mutation dùng để làm gì?
19. Vì sao nên tách API call ra service layer thay vì gọi `fetch` trực tiếp trong component?
20. Vì sao nên tách logic query/prefetch ra custom hook?
21. Trong Next.js client component, vì sao cần `QueryClientProvider`?
22. Vì sao thường tạo `QueryClient` bằng `useState(() => new QueryClient())`?
23. Khi pagination mỗi page có query key riêng, cache sẽ được tổ chức như thế nào?
24. Nếu API trả `{ data, total, hasNextPage }`, nên xử lý shape đó ở service, hook hay component?
25. Làm sao dùng React Query Devtools để kiểm tra cache?

## Gợi Ý Trả Lời Phỏng Vấn

1. TanStack Query giúp quản lý server state trong React: fetch data, cache, loading/error state, refetch, pagination, mutation và đồng bộ UI sau khi dữ liệu thay đổi.

2. `useQuery` dùng để đọc dữ liệu, thường là GET. `useMutation` dùng để thay đổi dữ liệu, thường là POST, PATCH, PUT hoặc DELETE.

3. `queryKey` là định danh của dữ liệu trong cache. Nó phải ổn định vì TanStack Query dựa vào key để biết data nào đang được cache, refetch hoặc update.

4. Nếu hai query có cùng `queryKey`, chúng dùng chung cache. Component sau có thể lấy lại data đã fetch từ component trước.

5. `staleTime` là thời gian data được xem là fresh. Trong thời gian đó, TanStack Query ít cần refetch lại. Cache còn tồn tại là chuyện khác: data vẫn có thể nằm trong cache dù đã stale.

6. Data đã cache vẫn refetch nếu data bị stale, component mount lại, window focus lại, network reconnect, hoặc bị `invalidateQueries`.

7. `isPending` là loading lần đầu khi chưa có data. `isFetching` là đang fetch, kể cả khi đã có data cũ.

8. Dùng `placeholderData: keepPreviousData` khi pagination hoặc đổi filter, để giữ data cũ trong lúc data mới đang tải.

9. `isPlaceholderData` cho biết UI đang hiển thị data tạm thời, chưa phải data thật của query key hiện tại.

10. `prefetchQuery` dùng để tải trước data vào cache trước khi user thật sự cần.

11. Vì nếu key khác nhau, prefetch sẽ lưu vào cache khác. Khi `useQuery` chạy với key thật, nó không thấy cache đã prefetch và vẫn request lại.

12. `invalidateQueries` đánh dấu query là stale và cho phép refetch lại. Nó không tự sửa data ngay lập tức.

13. `invalidateQueries({ queryKey: ["posts"] })` ảnh hưởng đến các query có key bắt đầu bằng `["posts"]`, ví dụ `["posts", "list"]` và `["posts", "pagination", 1]`.

14. `setQueryData` update một cache key cụ thể. `setQueriesData` update nhiều cache key khớp điều kiện.

15. Với like một post, nên update cache trực tiếp nếu biết post nào thay đổi, vì tránh refetch toàn bộ list. Nhưng nếu logic phức tạp, invalidate sẽ đơn giản và an toàn hơn.

16. Optimistic update là cập nhật UI trước khi server trả kết quả, để người dùng thấy phản hồi ngay. Nếu server lỗi thì rollback lại.

17. `onSuccess` chạy khi mutation thành công. `onError` chạy khi mutation lỗi. `onSettled` luôn chạy sau mutation, dù thành công hay lỗi.

18. `variables` là tham số đã truyền vào `mutate`. Ví dụ `mutate(true)` thì `variables` là `true`.

19. Tách API ra service layer giúp component sạch hơn, hook dễ đọc hơn, dễ đổi API URL, dễ reuse và type dữ liệu rõ ràng.

20. Tách logic query/prefetch ra custom hook giúp component chỉ lo UI. Logic cache, query key, stale time, prefetch nằm cùng một chỗ dễ bảo trì hơn.

21. Vì `QueryClientProvider` cung cấp `QueryClient` cho toàn app. Không có provider thì `useQuery`, `useMutation`, `useQueryClient` không dùng được cache chung.

22. Dùng `useState(() => new QueryClient())` để tạo `QueryClient` một lần duy nhất, tránh tạo lại mỗi lần render.

23. Mỗi page có một cache key riêng, ví dụ `["posts", "pagination", 1]`, `["posts", "pagination", 2]`. Khi quay lại page cũ, TanStack Query có thể lấy từ cache.

24. Tùy mục đích. Nếu component chỉ cần array thì nên bóc ở service hoặc hook để component dùng `data` đơn giản. Nếu component cần metadata như `total`, `hasNextPage`, thì giữ object `{ data, total, hasNextPage }`.

25. Mở React Query Devtools để xem query key, trạng thái fresh/stale, data đang cache, query nào đang fetching và query nào bị invalidate.

## Câu Tổng Kết Khi Phỏng Vấn

TanStack Query không thay thế API service, mà quản lý server state phía client. Em thường tách API vào service, tách query/mutation vào custom hook, dùng `queryKey` ổn định, set `staleTime` hợp lý, dùng `invalidateQueries` khi cần refetch và `setQueryData` khi muốn update cache trực tiếp.
