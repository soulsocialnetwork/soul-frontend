

export interface UserResponse {
id: string;
name: string;
username: string;
profilePicture: string | null;
bio: string | null;
accountStatus: boolean;
privacyStatus: boolean;
metricsStatus: boolean;
}

export interface CurrentUserResponse {
id: string;
name: string;
username: string;
email: string;
dateOfBirth: string;
profilePicture: string | null;
bio: string | null;
createdAt: string;
accountStatus: boolean;
privacyStatus: boolean;
metricsStatus: boolean;
}

export interface LoginResponse {
token: string;
refreshToken: string;
user: UserResponse;
}

export interface LoginRequest {
email: string;
password: string;
}

export interface RefreshTokenRequest {
refreshToken: string;
}


export interface PublicProfileResponse {
id: string;
name: string;
username: string;
profilePicture: string | null;
bio: string | null;
privateProfile: boolean;
postCount: number;
followerCount: number;
followingCount: number;
}

export interface ProfileSummary {
id: string;
name: string;
username: string;
profilePicture: string | null;
bio: string | null;
privateProfile: boolean;
}

export interface FollowRelationshipResponse {
  status: 'NOT_FOLLOWING' | 'PENDING' | 'FOLLOWING';
}

export interface FollowRequestResponse {
  id: string;
  follower: ProfileSummary;
  createdAt: string;
}

export interface PageFollowRequestResponse {
  content: FollowRequestResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PageProfileResponse {
content: ProfileSummary[];
totalPages: number;
totalElements: number;
size: number;
number: number;
first: boolean;
last: boolean;
}

export interface PostResponse {
id: string;
content: string;
imageUrl: string | null;
createdAt: string;
userId: string;
username: string;
name: string;
profilePicture: string | null;
}

export interface PostRequest {
content: string;
imageUrl?: string;
category?: string;
}

export interface PagePostResponse {
  content: PostResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface LikeCountResponse {
  likes: number;
}

export interface CommentCountResponse {
  comments: number;
}

export interface CommentResponse {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  username: string;
  name: string;
  profilePicture: string | null;
}

export interface PageCommentResponse {
  content: CommentResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
