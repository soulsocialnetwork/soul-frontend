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
banned?: boolean;
id: string;
name: string;
username: string;
avatarUrl: string;
bio: string;
verified: boolean;
connectionsCount: number;
followerCount: number;
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
banned: profile.banned,
name: profile.name,
username: profile.username,
avatarUrl: profile.profilePicture || '',
bio: profile.bio || '',
verified: profile.verified,
connectionsCount: profile.followerCount,
followerCount: profile.followerCount,
friendsCount: profile.realFriendsCount,
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

async inviteRealFriend(username: string): Promise<void> {
  await api.post(`/profiles/${encodeURIComponent(username)}/real-friends`);
},

async getRealFriendStatus(username: string): Promise<'NONE' | 'SENT' | 'RECEIVED' | 'FRIENDS'> {
  const response = await api.get<{ status: 'NONE' | 'SENT' | 'RECEIVED' | 'FRIENDS' }>(`/profiles/${encodeURIComponent(username)}/real-friends/status`);
  return response.data.status;
},

async getRealFriendRequests(): Promise<{ id: string; username: string; name: string }[]> {
  const response = await api.get<{ id: string; username: string; name: string }[]>('/profiles/me/real-friends/requests');
  return response.data;
},

async acceptRealFriendRequest(id: string): Promise<void> {
  await api.post(`/profiles/me/real-friends/requests/${encodeURIComponent(id)}/accept`);
},

async getRealFriendIds(): Promise<string[]> {
  const response = await api.get<{ id: string }[]>('/profiles/me/real-friends');
  return response.data.map(friend => friend.id);
},

async getRealFriends(): Promise<{ id: string; username: string; name: string }[]> {
  const response = await api.get<{ id: string; username: string; name: string }[]>('/profiles/me/real-friends');
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
