/**
 * Netlify Function: TMDB API Proxy
 * Securely proxies search, discovery, and recommendation requests to TMDB
 * without exposing the TMDB_API_KEY to the browser / frontend bundle.
 */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "TMDB_API_KEY is not configured on Netlify environment." }),
    };
  }

  // Extract path and query parameters
  // Expected query format: /.netlify/functions/tmdb-proxy?endpoint=/search/multi&query=Inception
  const { endpoint, ...queryParams } = event.queryStringParameters || {};

  if (!endpoint) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing required 'endpoint' parameter." }),
    };
  }

  // Build target URL
  const url = new URL(`${TMDB_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);
  url.searchParams.set("api_key", apiKey);

  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Failed to communicate with TMDB API", details: error.message }),
    };
  }
};
