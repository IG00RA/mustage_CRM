import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
const KEY_FILE_PATH = process.env.GOOGLE_KEY_FILE_PATH || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the file:', err);
      return res.status(500).json({ error: 'Error parsing file' });
    }

    const uploadedFile = files.file;
    let file: formidable.File | undefined;

    if (Array.isArray(uploadedFile)) {
      file = uploadedFile[0];
    } else {
      file = uploadedFile;
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE_PATH,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      const drive = google.drive({ version: 'v3', auth });

      const fileMetadata = {
        name: file.originalFilename || 'uploaded_file',
        parents: [FOLDER_ID],
      };

      const media = {
        mimeType: file.mimetype || 'application/octet-stream',
        body: fs.createReadStream(file.filepath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      const fileId = response.data.id;

      if (!fileId) {
        throw new Error('File ID is undefined or null.');
      }

      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      res.status(200).json({ fileId });
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      res.status(500).json({ error: 'Error uploading to Google Drive' });
    }
  });
}
