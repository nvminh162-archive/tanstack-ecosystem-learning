import { type CreatePostInput, postsService } from "@/services/posts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePost() {
  const queryClient = useQueryClient(); // ko phải tạo ra thực thể mới mà thấy ra từ provider cung cấp

  return useMutation({
    mutationFn: (data: CreatePostInput) => postsService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      console.log("Created ", data.id);
    },
    onError: (data) => console.error("Error ", data.message),
    onSettled: () => console.log("Finally: mutation done!"),
  });
}
