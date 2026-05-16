// netlify/functions/check-status.js
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const API_KEY = process.env.ATLASCLOUD_API_KEY;
  if (!API_KEY) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'ATLASCLOUD_API_KEY not set' }) };

  const predictionId = event.queryStringParameters?.id;
  if (!predictionId) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };

  try {
    const response = await fetch(
      `https://api.atlascloud.ai/api/v1/model/prediction/${encodeURIComponent(predictionId)}`,
      { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );
    const result = await response.json();
    return { statusCode: response.status, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
