import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../src/middleware.ts';

test('middleware allows non-control paths', async () => {
  const context = {
    url: new URL('http://localhost/about'),
    request: new Request('http://localhost/about'),
    locals: {}
  };
  const next = async () => new Response('OK', { status: 200 });

  const response = await onRequest(context, next);
  assert.equal(response.status, 200);
});

test('middleware allows /controllers path (no prefix match)', async () => {
  const context = {
    url: new URL('http://localhost/controllers'),
    request: new Request('http://localhost/controllers'),
    locals: {}
  };
  const next = async () => new Response('OK', { status: 200 });

  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const response = await onRequest(context, next);
    assert.equal(response.status, 200);
  } finally {
    process.env.NODE_ENV = oldEnv;
  }
});

test('middleware blocks unauthenticated /control paths in production', async () => {
  const context = {
    url: new URL('http://localhost/control/content'),
    request: new Request('http://localhost/control/content'),
    locals: {}
  };
  const next = async () => new Response('OK', { status: 200 });

  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const response = await onRequest(context, next);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('WWW-Authenticate'), 'Basic realm="HP Control"');
  } finally {
    process.env.NODE_ENV = oldEnv;
  }
});

test('middleware blocks /control paths if secret is unset, even with arbitrary auth header', async () => {
  const context = {
    url: new URL('http://localhost/control/content'),
    request: new Request('http://localhost/control/content', {
      headers: { authorization: 'Bearer anything' }
    }),
    locals: { runtime: { env: {} } }
  };
  const next = async () => new Response('OK', { status: 200 });

  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const response = await onRequest(context, next);
    assert.equal(response.status, 401);
  } finally {
    process.env.NODE_ENV = oldEnv;
  }
});

test('middleware allows authenticated /control paths in production via Basic Auth', async () => {
  const auth = Buffer.from('admin:supersecret').toString('base64');
  const context = {
    url: new URL('http://localhost/control/content'),
    request: new Request('http://localhost/control/content', {
      headers: { authorization: `Basic ${auth}` }
    }),
    locals: {
      runtime: {
        env: { CONTROL_SECRET: 'supersecret' }
      }
    }
  };
  const next = async () => new Response('OK', { status: 200 });

  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const response = await onRequest(context, next);
    assert.equal(response.status, 200);
  } finally {
    process.env.NODE_ENV = oldEnv;
  }
});

test('middleware allows authenticated /control paths in production via Bearer token', async () => {
  const context = {
    url: new URL('http://localhost/control/content'),
    request: new Request('http://localhost/control/content', {
      headers: { authorization: 'Bearer supersecret' }
    }),
    locals: {
      runtime: {
        env: { CONTROL_SECRET: 'supersecret' }
      }
    }
  };
  const next = async () => new Response('OK', { status: 200 });

  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const response = await onRequest(context, next);
    assert.equal(response.status, 200);
  } finally {
    process.env.NODE_ENV = oldEnv;
  }
});
