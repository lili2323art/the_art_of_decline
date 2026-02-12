import { NextRequest, NextResponse } from 'next/server';
import { fetchCompletePersonality } from '@/lib/second-me';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 });

    try {
        let user;
        if (token === 'dummy_token' || token.startsWith('test_')) {
            user = {
                name: "测试用户",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
                bio: "这是一个测试账号，致力于在社交场合中保持完美的体面。",
                shades: ["测试", "社交达人", "完美主义"],
                memories: ["曾在黑客松中表现优异", "擅长拒绝不合理的请求"]
            };
        } else {
            user = await fetchCompletePersonality(token);
        }

        // Construct a personality string for the prompt
        const personality = `
      姓名: ${user.name}
      简介: ${user.bio || '无'}
      兴趣: ${user.shades?.join(', ') || '无'}
      性格记忆: ${user.memories?.slice(0, 5).join('; ') || '无'}
    `;

        return NextResponse.json({
            nickname: user.name,
            avatar: user.avatar,
            personality
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch personality' }, { status: 500 });
    }
}
