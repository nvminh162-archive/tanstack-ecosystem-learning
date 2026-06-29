import { PaginatedPosts, Post, postsService } from "@/services/posts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleLike = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liked: boolean) => postsService.toggleLike(postId, liked),
    onSuccess: (updatedPost) => { // tham số nhận giá trị từ mutationFn vào updatedPost
        
        // cách 1: sau khi like fetch toàn bộ (không tốt)
        // queryClient.invalidateQueries({ queryKey: ["posts"] }); // cách cũ là sẽ fetch lại toàn bộ (không tối ưu) => vào trong store sửa trực tiếp dữ liệu update
        // console.log("Like updated ", updatedPost.id);

        // cách 2: chỉ update post data like trong cache ko fetch toàn bộ
        const applyUpdate = (post: Post) => post.id === updatedPost.id ? updatedPost : post;
        queryClient.setQueriesData<PaginatedPosts>( // update số lượng trên paginate post (#1 có 100 like thành 99 like)
            {
                queryKey: ["posts", "pagination"]
            },
            (oldDataCache) => oldDataCache && {...oldDataCache, data: oldDataCache.data.map(applyUpdate)}
        )
        queryClient.setQueryData<Post[]>( // upadate thông tin của bài post
            ["posts", "list"],
            (oldDataCache) => oldDataCache?.map(applyUpdate)
        )
    },
  });
};
