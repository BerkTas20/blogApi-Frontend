import { http } from "./http";
import type { LoginRequest, LoginResponse, PostResponse, PostDto, CommentDto,
  SaveAndUpdateCommentRequest, UpdatePostRequest, CategoryDto, SaveAndUpdateCategoryRequest, LikeDto, PopularPostDto} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090/api/v1";

export const api = {
  login: (payload: LoginRequest) =>
    http.post<LoginResponse>("/account/login", payload).then((r) => r.data),

  me: () => http.get("/account").then((r) => r.data),

  getPosts: (pageNumber: number, pageSize: number, sortBy = "id", sortDir = "asc") =>
    http
      .get<PostResponse>("/post", { params: { pageNumber, pageSize, sortBy, sortDir } })
      .then((r) => r.data),

  getPostPhotoUrl: (postId: number) => `${API_BASE}/photo/post/${postId}`,

  getPostById: (id: number) =>
    http.get<PostDto>(`/post/${id}`).then((r) => r.data),

  createPost: (
    userId: number,
    categoryId: number,
    title: string,
    description: string
  ) =>
    http
      .post(
        `/post/${userId}/categories/${categoryId}`,
        null,
        {
          params: {
            title,
            description,
          },
        }
      )
      .then((r) => r.data),

      uploadPostPhoto: (postId: number, userId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return http.post(
    `/photo/${postId}/${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"},
    });
  },

  // ✅ COMMENTS
  getComments: (postId: number) =>
    http
      .get<CommentDto[]>("/comment", { params: { postId } })
      .then((r) => r.data),

  createComment: (postId: number, userId: number, description: string) =>
    // OpenAPI'nda commentRequest query olarak geçiyor, bu yüzden params kullanıyoruz
    http
      .post<CommentDto>("/comment", null, {
        params: { postId, userId, description },
      })
      .then((r) => r.data),

  updateComment: (commentId: number, payload: SaveAndUpdateCommentRequest) =>
    http.put<CommentDto>(`/comment/${commentId}`, payload).then((r) => r.data),

  deleteComment: (commentId: number) =>
    http.delete(`/comment/${commentId}`).then((r) => r.data),

  updatePost: (id: number, payload: UpdatePostRequest) =>
  http.put<PostDto>(`/post/${id}`, payload).then((r) => r.data),

  deletePost: (id: number) =>
  http.delete(`/post/${id}`).then((r) => r.data),

   getCategories: () =>
    http.get<CategoryDto[]>("/category").then((r) => r.data),

  getCategoryById: (id: number) =>
    http.get<CategoryDto>(`/category/${id}`).then((r) => r.data),

  createCategory: (payload: SaveAndUpdateCategoryRequest) =>
    http
      .post<CategoryDto>("/category", null, {
        // swagger: saveAndUpdateCategoryRequest in query
        params: {
          title: payload.title,
          description: payload.description,
        },
      })
      .then((r) => r.data),

  updateCategory: (id: number, payload: SaveAndUpdateCategoryRequest) =>
    http
      .put<CategoryDto>(`/category/${id}`, null, {
        params: {
          title: payload.title,
          description: payload.description,
        },
      })
      .then((r) => r.data),

  deleteCategory: (id: number) =>
    http.delete(`/category/${id}`).then((r) => r.data),

  likePost: (userId: number, postId: number) =>
    http.post<LikeDto>("/like", null, { params: { userId, postId } }).then(r => r.data),

  unlikePost: (userId: number, postId: number) =>
    http.delete("/like", { params: { userId, postId } }).then(r => r.data),

  getLikeCount: (postId: number) =>
    http.get<number>("/like/count", { params: { postId } }).then(r => r.data),

  getMyLike: (userId: number, postId: number) =>
    http.get<LikeDto>("/like/me", { params: { userId, postId } }).then(r => r.data),

  getPopularPosts: (limit = 5) =>
    http.get<PopularPostDto[]>("/post/popular", { params: { limit } }).then(r => r.data),

   createLike: (userId: number, postId: number) =>
    http
      .post<LikeDto>("/like", null, { params: { userId, postId } })
      .then((r) => r.data),

  deleteLike: (likeId: number) =>
    http.delete<void>(`/like/${likeId}`).then((r) => r.data),
};
