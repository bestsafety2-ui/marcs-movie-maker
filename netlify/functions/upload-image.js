// netlify/functions/upload-image.js
// Uploads source image to Atlas Cloud using FormData (more reliable than manual multipart).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const API_KEY = process.env.ATLASCLOUD_API_KEY;
  if (!API_KEY) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'ATLASCLOUD_API_KEY not set' }) };

  try {
    const { image_base64, filename } = JSON.parse(event.body);
    if (!image_base64) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing image_base64' }) };

    // Strip the data URL prefix if present
    const base64Data = image_base64.includes(',') ? image_base64.split(',')[1] : image_base64;
    const mimeMatch = image_base64.match(/^data:(image\/[\w+]+);base64,/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // Decode base64 to a Blob (Node 18+ has Blob natively)
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: mime });

    // Use native FormData (Node 18+) — handles multipart encoding correctly
    const form = new FormData();
    const safeName = (filename || 'source.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
    form.append('file', blob, safeName);

    const response = await fetch('https://api.atlascloud.ai/api/v1/model/uploadMedia', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: form
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: CORS,
        body: JSON.stringify({ error: result.error || result.message || `Upload failed: ${response.status}`, details: result })
      };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message, stack: err.stack }) };
  }
};
