import { NextRequest, NextResponse } from 'next/server';
import { chatWithKimi, calculatePullBarShift } from '@/lib/api';
import { SYSTEM_PROMPT_GIVER, SYSTEM_PROMPT_RECEIVER, GameState } from '@/lib/prompts';

export async function POST(req: NextRequest) {
    const { state }: { state: GameState } = await req.json();
    const newState = { ...state };

    try {
        // 1. Giver (AI) speaks first if it's the start or after user
        const giverPersonality = newState.userA?.personality || "普通的亲戚";
        const giverMessages = [
            { role: 'system', content: `${SYSTEM_PROMPT_GIVER}\n\n你的身份原型是：${giverPersonality}\n请以此性格特征来进行对话，保持二叔/大姨的身份但带有该原型的语气。` },
            ...newState.history.map(h => ({ role: h.role === 'giver' ? 'assistant' : 'user', content: h.content })),
        ];

        // Simplification for MVP: We'll do one turn at a time.
        // If turnCount is even, it's Giver's turn. 
        // If turnCount is odd, it's Receiver's turn reacting to Giver.

        const giverRes = await chatWithKimi(giverMessages);

        if (!giverRes.choices || giverRes.choices.length === 0) {
            console.error('Kimi API Error (Giver):', JSON.stringify(giverRes, null, 2));
            throw new Error(giverRes.error?.message || 'Invalid response from Kimi API');
        }

        const giverReplyData = JSON.parse(giverRes.choices[0].message.content);
        const giverReply = giverReplyData.reply;

        newState.history.push({ role: 'giver', content: giverReply });
        newState.pullBarPosition += calculatePullBarShift(giverReply, 'giver');

        // 2. Receiver (AI)
        const receiverPersonality = newState.userB?.personality || "普通的晚辈";
        const receiverMessages = [
            { role: 'system', content: `${SYSTEM_PROMPT_RECEIVER}\n\n你的身份原型是：${receiverPersonality}\n请以此核心性格特征来进行对话和产生内心OS。` },
            ...newState.history.map(h => ({ role: h.role === 'giver' ? 'user' : 'assistant', content: h.content })),
        ];

        const receiverRes = await chatWithKimi(receiverMessages);
        if (!receiverRes.choices || receiverRes.choices.length === 0) {
            console.error('Kimi API Error (Receiver):', JSON.stringify(receiverRes, null, 2));
            throw new Error(receiverRes.error?.message || 'Invalid response from Kimi API');
        }
        const receiverData = JSON.parse(receiverRes.choices[0].message.content);

        newState.history.push({
            role: 'receiver',
            content: receiverData.reply,
            innerOS: receiverData.innerOS
        });

        newState.pullBarPosition += calculatePullBarShift(receiverData.reply, 'receiver');
        newState.turnCount += 1;
        if (receiverData.reply.includes('收下') || receiverData.reply.includes('谢谢')) {
            newState.declineCount += 0; // Not a decline
        } else {
            newState.declineCount += 1;
        }

        // Check Win/Loss
        if (newState.pullBarPosition >= 100) {
            if (newState.declineCount >= 3) {
                newState.isGameOver = true;
                newState.result = 'accepted';
            } else {
                // Accepted too early! Giver might think you're greedy
                newState.isGameOver = true;
                newState.result = 'rejected'; // Loss: Greedy ending
            }
        } else if (newState.pullBarPosition <= -100) {
            newState.isGameOver = true;
            newState.result = 'uncle_took_back';
        }

        return NextResponse.json(newState);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to generate dialogue' }, { status: 500 });
    }
}
