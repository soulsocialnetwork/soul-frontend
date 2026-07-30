export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  author?: User;
}