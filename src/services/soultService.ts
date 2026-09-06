export interface SoultAuthor {
id: string;
name: string;
avatarUrl?: string;
verified?: boolean;
}

export interface SoultComment {
id: string;
author: string;
text: string;
time: string;
}

export interface Soult {
id: string;
title: string;
description: string;
videoUrl?: string;
thumbnailUrl: string;
duration: number;
likesCount: number;
commentsCount: number;
author: SoultAuthor;
createdAt: string;
initialComments?: SoultComment[];
}

export const soultService = {
async getSoults(): Promise<Soult[]> {
return [];
},

async likeSoult(_id: string): Promise<void> {
return;
},

formatDuration(seconds: number): string {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;


if (mins > 0) {
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

return `${secs}s`;

},
};
