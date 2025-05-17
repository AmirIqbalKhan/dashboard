import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a dashboard user.' },
        { role: 'user', content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch from OpenAI.' }, { status: 500 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  return NextResponse.json({ reply });
} 