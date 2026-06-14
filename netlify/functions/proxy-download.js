// netlify/functions/proxy-download.js
// Fetches Atlas Cloud output files server-side to bypass OSS referer policy.
// Alibaba OSS blocks direct browser access but allows server-to-server requests.

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const url = event.queryStringParameters?.url;
  if (!url) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing url param' }) };

  try {
    // Fetch without a Referer header — this bypasses Alibaba OSS bucket referer policy
    const response = await fetch(decodeURIComponent(url), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AtlasProxy/1.0)'
        // Deliberately no Referer header
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: CORS,
        body: JSON.stringify({ error: `Upstream fetch failed: ${response.status} ${response.statusText}` })
      };
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Determine filename from URL
    const urlPath = decodeURIComponent(url).split('?')[0];
    const filename = urlPath.split('/').pop() || 'output';

    return {
      statusCode: 200,
      headers: {
        ...CORS,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600'
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
