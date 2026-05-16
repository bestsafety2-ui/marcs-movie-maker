// netlify/functions/generate-video.js
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
    const payload = JSON.parse(event.body);
    const response = await fetch('https://api.atlascloud.ai/api/v1/model/generateVideo', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    return { statusCode: response.status, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
