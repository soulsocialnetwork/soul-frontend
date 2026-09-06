/**
 * Rotas conhecidas da API Spring Boot.
 * Sem implementação de chamadas e sem campos de resposta — etapa posterior.
 */
export const endpoints = {
  user: {
    create: '/user/create',
    login: '/user/login',
    logout: '/user/logout',
    me: '/user/me',
    password: '/user/me/password',
    email: '/user/me/email',
    privacy: '/user/me/privacy',
    forgotPassword: '/user/forgot-password',
    resetPassword: '/user/reset-password',
    refreshToken: '/user/refresh-token',
    followRequests: '/user/me/follow-requests',
    acceptFollowRequest: (requestId: string) => `/user/me/follow-requests/${requestId}/accept`,
    followRequest: (requestId: string) => `/user/me/follow-requests/${requestId}`,
  },
  profiles: {
    list: '/profiles',
    byUsername: (username: string) => `/profiles/${username}`,
    follow: (username: string) => `/profiles/${username}/follow`,
    followers: (username: string) => `/profiles/${username}/followers`,
    following: (username: string) => `/profiles/${username}/following`,
    posts: (username: string) => `/profiles/${username}/posts`,
    followStatus: (username: string) => `/profiles/${username}/follow-status`,
  },
  posts: {
    list: '/posts',
    byId: (postId: string) => `/posts/${postId}`,
    comments: (postId: string) => `/posts/${postId}/comments`,
    comment: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
    commentsCount: (postId: string) => `/posts/${postId}/comments/count`,
    like: (postId: string) => `/posts/${postId}/like`,
    likesCount: (postId: string) => `/posts/${postId}/likes/count`,
  },
  feed: {
    list: '/feed',
  },
} as const;

/**
 * Nomes de schemas / records do backend (soul-backend):
 * LoginResponseDTO, CurrentUserResponseDTO, UserResponseDTO,
 * PublicProfileResponse, PostResponse, CommentResponse,
 * FollowRelationshipResponse, LikeCountResponse,
 * PagePostResponse, PageCommentResponse, PageProfileSummary
 */
