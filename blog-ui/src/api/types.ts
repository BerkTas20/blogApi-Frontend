export type LoginRequest = { username?: string; password?: string; rememberMe?: boolean };
export type LoginResponse = { username?: string; token?: string };

export type PostDto = {
  id: number;
  title: string;
  description: string;
  createdDateTime?: string;
  updatedDateTime?: string;
   // ✅ kategori (backend hangisini dönüyorsa yakala)
  categoryId?: number;
  categoryTitle?: string;
  category?: CategoryDto;
};

export type PostResponse = {
  content: PostDto[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
  
};

export type CommentDto = {
  id: number;
  description: string;
  userId: number;
  userName: string;
};

export type SaveAndUpdateCommentRequest = {
  description: string;
};


export type UpdatePostRequest = {
  title?: string;
  description?: string;
};

// types.ts

export type CategoryDto = {
  id: number;
  title: string;
  description?: string;
};

// Swagger'da SaveAndUpdateCategoryRequest var
export type SaveAndUpdateCategoryRequest = {
  title: string;
  description?: string;
};

export type LikeDto = {
  id: number;
  userId: number;
  postId: number;
  createdDateTime?: string;
  updatedDateTime?: string;
};

export type PopularPostDto = {
  id: number;
  title: string;
  createdDateTime: string;
  likeCount: number;
};



