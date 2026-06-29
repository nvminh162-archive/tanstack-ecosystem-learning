import { postsService } from "@/services/posts";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function usePostsPagination({ page }: { page: number }) {
    return useQuery({
        queryKey: ["post", "pagination", page],
        queryFn: () => postsService.getByPage(page),
        placeholderData: keepPreviousData, // Trong lúc chờ dữ liệu load thì dùng keepPreData thay thế (giá trị lần fetch trước placeholder)
        staleTime: 60 * 1000,
    })
}