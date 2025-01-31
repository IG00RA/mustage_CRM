import { NextApiRequest, NextApiResponse } from 'next';

const ANALYTIC_BOT_TOKEN = process.env.ANALYTIC_BOT_TOKEN || '';
const ANALYTIC_CHAT_ID = process.env.ANALYTIC_CHAT_ID || '';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = `https://api.telegram.org/bot${ANALYTIC_BOT_TOKEN}/sendMessage`;

  const payload = {
    chat_id: ANALYTIC_CHAT_ID,
    parse_mode: 'html',
    text: req.body,
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed response from Telegram:', errorText);
      return res
        .status(response.status)
        .json({ error: 'Failed to send data to Telegram' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending data to Telegram:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
