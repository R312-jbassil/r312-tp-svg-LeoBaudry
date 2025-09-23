import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const POST = async ({ request }) => {
  try {
    const { name, code, chat_history } = await request.json();

    if (!name || !code) {
      return new Response("Name or code missing", { status: 400 });
    }

    // Crée un enregistrement dans PocketBase
    const record = await pb.collection('svgs').create({
      name,
      code,
      chat_history: chat_history || "[]", // stocke l’historique, vide si non fourni
    });

    return new Response(
      JSON.stringify({ success: true, id: record.id }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erreur sauvegarde SVG :", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
