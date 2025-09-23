import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const POST = async ({ request }) => {
  try {
    const { id, code, chat_history } = await request.json();

    if (!id || !code) {
      return new Response(JSON.stringify({ success: false, error: "ID ou code manquant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Met à jour le SVG existant
    const updatedRecord = await pb.collection('svgs').update(id, {
      code,
      chat_history: chat_history || "[]"
    });

    return new Response(
      JSON.stringify({ success: true, id: updatedRecord.id }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erreur update SVG :", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
