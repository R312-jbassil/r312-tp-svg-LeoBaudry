// src/pages/api/save-svg.js
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const POST = async ({ request }) => {
  try {
    const { name, code } = await request.json();
    if (!name || !code) return new Response("Name or code missing", { status: 400 });

    const record = await pb.collection('svgs').create({ name, code });
    return new Response(JSON.stringify(record), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
