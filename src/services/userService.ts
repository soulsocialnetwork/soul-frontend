import { api } from './api';
import type {
PagePostResponse,
PostResponse,
PublicProfileResponse,
FollowRelationshipResponse,
PageProfileResponse,
PageFollowRequestResponse,
} from './api/types';

export interface UserPost {
id: string;
imageUrl: string;
content?: string;
createdAt?: string;
}

export interface UserProfile {
id: string;
name: string;
username: string;
avatarUrl: string;
bio: string;
verified: boolean;
connectionsCount: number;
friendsCount: number;
postsCount: number;
posts: UserPost[];
privateProfile: boolean;
followingCount: number;
}

function mapPublicProfile(
profile: PublicProfileResponse
): UserProfile {
return {
id: profile.id,
name: profile.name,
username: profile.username,
avatarUrl: profile.profilePicture || '',
bio: profile.bio || '',
verified: false,
connectionsCount: profile.followerCount,
friendsCount: 0,
postsCount: profile.postCount,
posts: [],
privateProfile: profile.privateProfile,
followingCount: profile.followingCount,
};
}

function mapPost(post: PostResponse): UserPost {
return {
id: post.id,
imageUrl: post.imageUrl || '',
content: post.content,
createdAt: post.createdAt,
};
}

export const userService = {
async getByUsername(username: string): Promise<UserProfile | null> {
const response = await api.get<PublicProfileResponse>(
`/profiles/${encodeURIComponent(username)}`
);


return mapPublicProfile(response.data);


},

async getPostsByUsername(
username: string,
page: number = 0,
size: number = 10
): Promise<UserPost[]> {
const response = await api.get<PagePostResponse>(
`/profiles/${encodeURIComponent(username)}/posts`,
{
params: {
page,
size,
},
}
);


return response.data.content.map(mapPost);

},

async follow(username: string): Promise<void> {
await api.post(
`/profiles/${encodeURIComponent(username)}/follow`
);
},

async unfollow(username: string): Promise<void> {
await api.delete(
`/profiles/${encodeURIComponent(username)}/follow`
);
},

async getFollowStatus(
username: string
): Promise<FollowRelationshipResponse> {
const response = await api.get<FollowRelationshipResponse>(
`/profiles/${encodeURIComponent(username)}/follow-status`
);


return response.data;


},

async getFollowers(
username: string,
page: number = 0,
size: number = 20
): Promise<PageProfileResponse> {
const response = await api.get<PageProfileResponse>(
`/profiles/${encodeURIComponent(username)}/followers`,
{
params: {
page,
size,
},
}
);


return response.data;

},

async getFollowing(
username: string,
page: number = 0,
size: number = 20
): Promise<PageProfileResponse> {
const response = await api.get<PageProfileResponse>(
`/profiles/${encodeURIComponent(username)}/following`,
{
params: {
page,
size,
},
}
);


return response.data;

},

async searchProfiles(
query: string,
page: number = 0,
size: number = 20
): Promise<PageProfileResponse> {
const response = await api.get<PageProfileResponse>(
'/profiles',
{
params: {
query,
page,
size,
},
}
);


return response.data;


},

async validateFriendQr(
qrToken: string
): Promise<{ success: boolean; friendName?: string }> {
throw new Error(
`Validação de QR ainda não possui endpoint no backend: ${qrToken}`
);
},

async getFollowRequests(
  page: number = 0,
  size: number = 20
): Promise<PageFollowRequestResponse> {
  const response = await api.get<PageFollowRequestResponse>(
    '/user/me/follow-requests',
    {
      params: { page, size },
    }
  );
  return response.data;
},

async acceptFollowRequest(requestId: string): Promise<void> {
  await api.post(`/user/me/follow-requests/${encodeURIComponent(requestId)}/accept`);
},

async rejectFollowRequest(requestId: string): Promise<void> {
  await api.delete(`/user/me/follow-requests/${encodeURIComponent(requestId)}`);
},
};
