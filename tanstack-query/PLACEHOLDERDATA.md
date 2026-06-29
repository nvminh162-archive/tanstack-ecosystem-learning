Có liên quan trực tiếp giữa: isPlaceHolder và placeHolderData

```ts
placeholderData: keepPreviousData
```

là **cấu hình**: bảo TanStack Query rằng khi `queryKey` đổi, hãy tạm dùng data cũ trong lúc chờ data mới.

Còn:

```ts
isPlaceholderData
```

là **trạng thái boolean**: TanStack Query báo cho bạn biết data hiện tại có phải là placeholder data hay không.

Nói dễ hiểu:

```txt
placeholderData: keepPreviousData
= bật cơ chế giữ data cũ

isPlaceholderData
= báo hiện tại có đang dùng data cũ tạm thời không
```

Ví dụ:

Đang ở page 1:

```ts
queryKey: ["posts", "pagination", 1]
data = data page 1
isPlaceholderData = false
```

Bấm sang page 2, API page 2 chưa xong:

```ts
queryKey: ["posts", "pagination", 2]
data = data page 1 // giữ tạm nhờ keepPreviousData
isPlaceholderData = true
```

API page 2 xong:

```ts
queryKey: ["posts", "pagination", 2]
data = data page 2
isPlaceholderData = false
```

Trong component của bạn:

```tsx
className={`transition-opacity ${
  isPlaceholderData ? "opacity-50" : "opacity-100"
}`}
```

Nghĩa là:

```txt
Nếu đang hiển thị data cũ tạm thời thì làm mờ UI.
Nếu data mới đã về rồi thì hiện rõ UI.
```

Tóm lại:

```ts
placeholderData: keepPreviousData
```

là nguyên nhân làm `isPlaceholderData` có thể thành `true`.

Nếu bạn bỏ `placeholderData: keepPreviousData`, thì khi đổi page, thường `data` sẽ trống/undefined trong lúc chờ fetch, và `isPlaceholderData` không còn ý nghĩa như trong demo này nữa.