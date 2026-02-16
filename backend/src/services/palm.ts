import Anthropic from '@anthropic-ai/sdk';

export interface PalmResult {
  fortuneType: 'palm';
  analysis: string;
  lifeLine: string;
  headLine: string;
  heartLine: string;
  fateLine: string;
  overallMessage: string;
}

export async function getPalmFortune(imageBase64: string): Promise<PalmResult> {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('image is required');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const client = new Anthropic({ apiKey });

  // Detect media type from base64 header or default to jpeg
  let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
  let base64Data = imageBase64;

  if (imageBase64.startsWith('data:')) {
    const match = imageBase64.match(/^data:(image\/(jpeg|png|gif|webp));base64,(.+)$/);
    if (match) {
      mediaType = match[1] as typeof mediaType;
      base64Data = match[3];
    }
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: `あなたは熟練の手相占い師です。この手のひらの画像を分析し、以下のJSON形式で手相鑑定結果を返してください。

必ず以下の形式のJSONのみを返してください（説明文や前置きは不要です）：
{
  "analysis": "全体的な手相の分析（2-3文）",
  "lifeLine": "生命線の鑑定結果（1-2文）",
  "headLine": "頭脳線の鑑定結果（1-2文）",
  "heartLine": "感情線の鑑定結果（1-2文）",
  "fateLine": "運命線の鑑定結果（1-2文）",
  "overallMessage": "総合メッセージとアドバイス（2-3文）"
}

温かく前向きなトーンで、日本語で回答してください。`,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response from Claude API');
  }

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content.text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    return {
      fortuneType: 'palm',
      analysis: parsed.analysis || '手相の分析結果を取得できませんでした。',
      lifeLine: parsed.lifeLine || '生命線の情報を読み取れませんでした。',
      headLine: parsed.headLine || '頭脳線の情報を読み取れませんでした。',
      heartLine: parsed.heartLine || '感情線の情報を読み取れませんでした。',
      fateLine: parsed.fateLine || '運命線の情報を読み取れませんでした。',
      overallMessage: parsed.overallMessage || '手相からあなたの未来を読み解くことができました。',
    };
  } catch {
    // If JSON parsing fails, use the raw text
    return {
      fortuneType: 'palm',
      analysis: content.text,
      lifeLine: '生命線の詳細な分析をご覧ください。',
      headLine: '頭脳線の詳細な分析をご覧ください。',
      heartLine: '感情線の詳細な分析をご覧ください。',
      fateLine: '運命線の詳細な分析をご覧ください。',
      overallMessage: '手相全体からあなたの運勢を読み解きました。',
    };
  }
}
