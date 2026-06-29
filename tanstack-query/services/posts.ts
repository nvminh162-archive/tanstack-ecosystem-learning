import { request } from "@/utils/request";

export interface Post {
  id: number;
  title: string;
  body: string;
  liked: boolean;
  likes: number;
}

export interface CreatePostInput {
  title: string;
  body: string;
}

export interface PaginatedPosts {
  data: Post[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

const BASE = "/api/posts";

// ===== Dịch vụ =====
export const postsService = {
  async getAll(): Promise<PaginatedPosts> {
    const data = await request(BASE, {
      cache: "no-store",
    });
    return data;
  },

  async getByPage(page: number): Promise<PaginatedPosts> {
    const data = await request(`${BASE}?page=${page}&_limit=10`);
    return data;
  },

  async getById(id: number): Promise<Post> {
    const data = await request(`${BASE}/${id}`, {
      cache: "no-store",
    });
    return data;
  },

  async create(data: CreatePostInput): Promise<Post> {
    const result = await request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return result;
  },

  async toggleLike(id: number, liked: boolean): Promise<Post> {
    const result = await request(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked }),
    });

    return result;
  },
};
