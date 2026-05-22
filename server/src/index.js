function genId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
}

function auth(request, env) {
  const header = request.headers.get('Authorization');
  if (!header || !header.startsWith('Bearer ') || header.slice(7) !== env.API_KEY) {
    return false;
  }
  return true;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getBody(request) {
  return await request.json();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Health check
    if (path === '/api/health' && method === 'GET') {
      return json({ status: 'ok' });
    }

    // Auth check for all /api/notes routes
    if (path.startsWith('/api/notes')) {
      if (!auth(request, env)) {
        return json({ error: 'Unauthorized' }, 401);
      }
    }

    // GET /api/notes - list all notes (id, title, updated)
    if (path === '/api/notes' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id, title, updated, deleted FROM notes ORDER BY updated DESC').all();
      return json(results);
    }

    // POST /api/notes - create a note
    if (path === '/api/notes' && method === 'POST') {
      const { title, content } = await getBody(request);
      const id = genId();
      const updated = Date.now();
      await env.DB.prepare('INSERT INTO notes (id, title, content, updated, deleted) VALUES (?, ?, ?, ?, 0)').bind(id, title || '', content || '', updated).run();
      return json({ id, title: title || '', content: content || '', updated, deleted: 0 }, 201);
    }

    // PUT /api/notes - bulk upsert
    if (path === '/api/notes' && method === 'PUT') {
      const { notes: incoming } = await getBody(request);
      if (!Array.isArray(incoming)) {
        return json({ error: 'notes array required' }, 400);
      }
      for (const n of incoming) {
        if (!n.id) continue;
        const existing = await env.DB.prepare('SELECT updated FROM notes WHERE id = ?').bind(n.id).first();
        if (!existing || n.updated > existing.updated) {
           await env.DB.prepare('INSERT INTO notes (id, title, content, updated, deleted) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, content=excluded.content, updated=excluded.updated, deleted=excluded.deleted').bind(n.id, n.title || '', n.content || '', n.updated || Date.now(), n.deleted ? 1 : 0).run();
        }
      }
      return json({ ok: true });
    }

    // GET /api/notes/:id - get single note
    const singleMatch = path.match(/^\/api\/notes\/([^/]+)$/);
    if (singleMatch) {
      const noteId = singleMatch[1];

      if (method === 'GET') {
        const row = await env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(noteId).first();
        if (!row) return json({ error: 'Note not found' }, 404);
        return json(row);
      }

      if (method === 'PUT') {
        const { title, content } = await getBody(request);
        const updated = Date.now();
        const result = await env.DB.prepare('UPDATE notes SET title = ?, content = ?, updated = ? WHERE id = ?').bind(title || '', content || '', updated, noteId).run();
        if (result.meta.changes === 0) return json({ error: 'Note not found' }, 404);
        return json({ id: noteId, title: title || '', content: content || '', updated });
      }

      if (method === 'DELETE') {
        const updated = Date.now();
        const result = await env.DB.prepare('UPDATE notes SET deleted = 1, updated = ? WHERE id = ?').bind(updated, noteId).run();
        if (result.meta.changes === 0) return json({ error: 'Note not found' }, 404);
        return json({ ok: true });
      }
    }

    return json({ error: 'Not found' }, 404);
  },
};
