import Anthropic from '@anthropic-ai/sdk';
import { getZodiacFortune } from './zodiac';
import { getNumerologyFortune } from './numerology';
import { getKyuseiFortune } from './kyusei';
import { getShichuuFortune } from './shichuu';
import { getTarotFortune } from './tarot';

export interface AiReadingResult {
  fortuneType: 'ai-reading';
  reading: string;
  highlights: string[];
  luckyAction: string;
  includedFortunes: string[];
}

export async function getAiReadingFortune(
  birthday: string,
  name: string,
  bloodType?: string,
  birthTime?: string,
  gender?: string,
): Promise<AiReadingResult> {
  if (!birthday || !name) {
    throw new Error('birthday and name are required');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Gather fortune results
  const zodiac = getZodiacFortune(birthday);
  const numerology = getNumerologyFortune(birthday, name);
  const kyusei = getKyuseiFortune(birthday);
  const shichuu = getShichuuFortune(birthday, birthTime);
  const tarot = getTarotFortune();

  const includedFortunes = ['星座占い', '数秘術', '九星気学', '四柱推命', 'タロット占い'];

  // Build prompt
  const fortuneData = `
【星座占い】${zodiac.sign}（${zodiac.element}）- スコア: ${zodiac.score}/5
アドバイス: ${zodiac.advice}

【数秘術】運命数: ${numerology.destinyNumber}
性格特性: ${numerology.personalityTraits.join('、')}
年運: ${numerology.yearFortune}

【九星気学】${kyusei.star}（${kyusei.element}）- スコア: ${kyusei.score}/5
吉方位: ${kyusei.luckyDirection}

【四柱推命】日主: ${shichuu.dayMaster}
命式: ${shichuu.yearPillar} / ${shichuu.monthPillar} / ${shichuu.dayPillar}${shichuu.hourPillar ? ' / ' + shichuu.hourPillar : ''}

【タロット】
${tarot.cards.map(c => `${c.positionLabel}: ${c.name}${c.isReversed ? '（逆位置）' : '（正位置）'}`).join('\n')}
`.trim();

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `あなたは経験豊富な占い師です。以下の複数の占い結果を統合し、総合的な鑑定を行ってください。

対象者情報:
- 名前: ${name}
- 生年月日: ${birthday}
${bloodType ? `- 血液型: ${bloodType}型` : ''}
${birthTime ? `- 生まれ時刻: ${birthTime}` : ''}
${gender ? `- 性別: ${gender === 'male' ? '男性' : '女性'}` : ''}

各占いの結果:
${fortuneData}

以下のJSON形式で回答してください（JSONのみ、説明文や前置きは不要）：
{
  "reading": "総合鑑定文（300-500文字程度、段落分けして読みやすく）",
  "highlights": ["注目ポイント1", "注目ポイント2", "注目ポイント3"],
  "luckyAction": "今日おすすめの行動（1-2文）"
}

温かく前向きなトーンで、具体的なアドバイスを含めてください。`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response from Claude API');
  }

  try {
    let jsonStr = content.text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    return {
      fortuneType: 'ai-reading',
      reading: parsed.reading || '総合鑑定結果を取得できませんでした。',
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 3) : ['占いの結果を総合的に分析しました'],
      luckyAction: parsed.luckyAction || '心に余裕を持って一日を過ごしましょう。',
      includedFortunes,
    };
  } catch {
    return {
      fortuneType: 'ai-reading',
      reading: content.text,
      highlights: ['占いの結果を総合的に分析しました'],
      luckyAction: '心に余裕を持って一日を過ごしましょう。',
      includedFortunes,
    };
  }
}
