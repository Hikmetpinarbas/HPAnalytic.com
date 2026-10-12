import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../src/pages/api/youtube.json.ts';

test('YouTube API returns 502 instead of throwing 500 when fetch fails', async () => {
  // Save the original fetch
  const originalFetch = global.fetch;

  try {
    // Mock fetch to simulate a network error
    global.fetch = async () => {
      throw new Error('Simulated network failure');
    };

    // The handler requires locals.runtime.env.YOUTUBE_API_KEY
    const context = {
      locals: {
        runtime: {
          env: {
            YOUTUBE_API_KEY: 'fake-key'
          }
        }
      }
    };

    const response = await GET(context);

    // Without try/catch, this would throw before we get here.
    // If caught properly, it should return 502 Bad Gateway
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(body.error, 'Upstream API error');
  } finally {
    global.fetch = originalFetch;
  }
});

test('YouTube API handles non-JSON error responses gracefully', async () => {
  const originalFetch = global.fetch;

  try {
    global.fetch = async () => {
      return new Response('<html>500 Server Error</html>', { status: 500 });
    };

    const context = {
      locals: { runtime: { env: { YOUTUBE_API_KEY: 'fake-key' } } }
    };

    const response = await GET(context);

    // We expect it to not throw, but handle the JSON parse error or bad status
    assert.equal(response.status, 502);
  } finally {
    global.fetch = originalFetch;
  }
});
