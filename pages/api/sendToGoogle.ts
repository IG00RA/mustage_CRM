import { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed response from Google Script:', errorText);
      return res
        .status(response.status)
        .json({ error: 'Failed to send data to Google Script' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending data to Google Script:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
