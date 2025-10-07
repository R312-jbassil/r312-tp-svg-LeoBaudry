// src/pages/api/signup.js
import pb from "../../utils/pb";
import { Collections } from "../../utils/pocketbase-typegen.ts";

export const POST = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email et mot de passe requis" }), { status: 400 });
    }

    // Création de l'utilisateur dans PocketBase
    const userRecord = await pb.collection(Collections.Users).create({
      email,
      password,
      passwordConfirm: password, // PocketBase demande la confirmation
    });

    // Connexion automatique
    const authData = await pb.collection(Collections.Users).authWithPassword(email, password);

    // Création du cookie d'authentification PocketBase
    cookies.set("pb_auth", pb.authStore.exportToCookie(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
    });

    // Retourne les infos utilisateur côté front-end
    return new Response(JSON.stringify({ user: authData.record }), { status: 200 });

  } catch (err) {
    console.error("Erreur signup:", err);
    return new Response(JSON.stringify({ error: "Impossible de créer le compte : " + err.message }), { status: 400 });
  }
};
