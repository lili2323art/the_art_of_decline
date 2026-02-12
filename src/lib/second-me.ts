import axios from 'axios';

const SECONDME_BASE_URL = 'https://app.mindos.com/gate/lab';

export interface SecondMeUser {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    shades?: string[];
    memories?: string[];
}

export async function getSecondMeUserInfo(accessToken: string): Promise<SecondMeUser> {
    const response = await axios.get(`${SECONDME_BASE_URL}/api/secondme/user/info`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { userId, name, avatar, bio } = response.data.data;
    return { id: userId, name, avatar, bio };
}

export async function getSecondMeUserShades(accessToken: string): Promise<string[]> {
    const response = await axios.get(`${SECONDME_BASE_URL}/api/secondme/user/shades`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    // Based on doc: response.data.data.shades is the array
    return response.data.data.shades?.map((shade: any) => shade.shadeNamePublic || shade.shadeName) || [];
}

export async function getSecondMeUserMemories(accessToken: string): Promise<string[]> {
    // Based on doc: endpoint is /api/secondme/user/softmemory
    const response = await axios.get(`${SECONDME_BASE_URL}/api/secondme/user/softmemory`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    // Based on doc: response.data.data.list is the array
    return response.data.data.list?.map((memory: any) => `${memory.factObject}: ${memory.factContent}`) || [];
}

export async function fetchCompletePersonality(accessToken: string): Promise<SecondMeUser> {
    const results = await Promise.allSettled([
        getSecondMeUserInfo(accessToken),
        getSecondMeUserShades(accessToken),
        getSecondMeUserMemories(accessToken),
    ]);

    const info = results[0].status === 'fulfilled' ? results[0].value : { id: 'unknown', name: 'Second Me 用户', avatar: '' };
    const shades = results[1].status === 'fulfilled' ? results[1].value : [];
    const memories = results[2].status === 'fulfilled' ? results[2].value : [];

    return {
        ...info,
        shades,
        memories,
    };
}
