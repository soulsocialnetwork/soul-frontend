import { api, endpoints } from './api';
import type {
  PostResponse,
  PostRequest,
  PagePostResponse,
  LikeCountResponse,
  CommentCountResponse,
} from './api/types';

export interface PostComment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  initialComments?: PostComment[];
}

function convertPostResponseToPost(
  postResponse: PostResponse
): Post {
  return {
    id: postResponse.id,
    author: {
      id: postResponse.userId,
      name: postResponse.name,
      username: postResponse.username,
      avatarUrl: postResponse.profilePicture || undefined,
      verified: false,
    },
    content: postResponse.content,
    imageUrl: postResponse.imageUrl || undefined,
    likesCount: 0,
    commentsCount: 0,
    createdAt: postResponse.createdAt,
  };
}

export const postService = {
  async getFeed(
    page: number = 0,
    size: number = 20
  ): Promise<Post[]> {
    const response = await api.get<PagePostResponse>(
      endpoints.feed.list,
      {
        params: {
          page,
          size,
        },
      }
    );

    return response.data.content.map(convertPostResponseToPost);
  },

  async getFeedPaged(
    page: number = 0,
    size: number = 20
  ): Promise<{ posts: Post[]; isLast: boolean; totalPages: number }> {
    const response = await api.get<PagePostResponse>(
      endpoints.feed.list,
      {
        params: {
          page,
          size,
        },
      }
    );

    return {
      posts: response.data.content.map(convertPostResponseToPost),
      isLast: response.data.last,
      totalPages: response.data.totalPages,
    };
  },

  async getPosts(
    page: number = 0,
    size: number = 10
  ): Promise<Post[]> {
    const response = await api.get<PagePostResponse>(
      endpoints.posts.list,
      {
        params: {
          page,
          size,
        },
      }
    );

    return response.data.content.map(convertPostResponseToPost);
  },

  async getPostById(postId: string): Promise<Post> {
    const response = await api.get<PostResponse>(
      endpoints.posts.byId(postId)
    );

    return convertPostResponseToPost(response.data);
  },

  async createPost(data: PostRequest): Promise<Post> {
    const response = await api.post<PostResponse>(
      endpoints.posts.list,
      data
    );

    return convertPostResponseToPost(response.data);
  },

  async updatePost(
    postId: string,
    data: PostRequest
  ): Promise<Post> {
    const response = await api.put<PostResponse>(
      endpoints.posts.byId(postId),
      data
    );

    return convertPostResponseToPost(response.data);
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(endpoints.posts.byId(postId));
  },

  async likePost(postId: string): Promise<void> {
    await api.post(endpoints.posts.like(postId));
  },

  async unlikePost(postId: string): Promise<void> {
    await api.delete(endpoints.posts.like(postId));
  },

  async getLikesCount(postId: string): Promise<number> {
    const response = await api.get<LikeCountResponse>(
      endpoints.posts.likesCount(postId)
    );
    return response.data.likes;
  },

  async getCommentsCount(postId: string): Promise<number> {
    const response = await api.get<CommentCountResponse>(
      endpoints.posts.commentsCount(postId)
    );
    return response.data.comments;
  },

  async getComments(postId: string, page: number = 0, size: number = 50): Promise<import('./api/types').CommentResponse[]> {
    const response = await api.get<import('./api/types').PageCommentResponse>(
      `/posts/${encodeURIComponent(postId)}/comments`,
      { params: { page, size } }
    );
    return response.data.content;
  },

  async createComment(postId: string, content: string): Promise<import('./api/types').CommentResponse> {
    const response = await api.post<import('./api/types').CommentResponse>(
      `/posts/${encodeURIComponent(postId)}/comments`,
      { content }
    );
    return response.data;
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`);
  },

  async hasLiked(postId: string): Promise<boolean> {
    const response = await api.get<{ liked: boolean }>(
      `/posts/${encodeURIComponent(postId)}/likes/me`
    );
    return response.data.liked;
  },

  async uploadMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },
};