// src/pages/api/signup.js
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

export const POST = async ({ request, cookies }) => {
  try {
    console.log("📝 Début inscription...");
    
    const { email, password } = await request.json();
    console.log("📧 Email reçu:", email);
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email et mot de passe requis" }), { status: 400 });
    }

    console.log("🔨 Tentative création user...");
    
    // Création de l'utilisateur
    const userRecord = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
    });

    console.log("✅ User créé:", userRecord.id);

    // Connexion automatique
    console.log("🔐 Connexion auto...");
    const authData = await pb.collection("users").authWithPassword(email, password);
    
    console.log("✅ Connecté:", authData.record.id);

    // Création du cookie
    cookies.set("pb_auth", pb.authStore.exportToCookie(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    return new Response(JSON.stringify({ user: authData.record }), { status: 200 });
    
  } catch (err) {
    console.error("❌ Erreur complète:", err);
    console.error("❌ Message:", err.message);
    console.error("❌ Data:", err.data);
    
    return new Response(JSON.stringify({ 
      error: err.message,
      details: err.data || {}
    }), { status: 400 });
  }
};