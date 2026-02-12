export async function chatWithKimi(messages: any[]) {
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });
  return response.json();
}

export function calculatePullBarShift(content: string, role: 'giver' | 'receiver'): number {
  const keywordsAccept = ['收下', '拿着', '给孩子的', '别客气', '好啦', '塞', '就这一次', '行吧'];
  const keywordsReject = ['不收', '不可以', '使不得', '真不用', '太客气', '回去', '拿走'];

  let score = 0;
  keywordsAccept.forEach(k => { if (content.includes(k)) score += 15; });
  keywordsReject.forEach(k => { if (content.includes(k)) score -= 15; });

  if (role === 'giver') return score > 0 ? score : 10; // Giver usually pushes towards accept
  return score;
}
