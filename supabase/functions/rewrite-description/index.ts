import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, productType, mode } = await req.json();

    const typeLabels: Record<string, string> = {
      file: "fichier numérique",
      course: "formation en ligne",
      license: "licence logicielle",
      bundle: "bundle de produits",
    };

    const typeLabel = typeLabels[productType] || "produit numérique";

    // Configuration des prompts en fonction du mode
    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "title") {
      systemPrompt = `Tu es un expert en copywriting et e-commerce. Ton but est de générer des titres de produits courts, percutants et très professionnels.`;
      userPrompt = `Réécris et améliore ce titre de produit : "${title}" (type: ${typeLabel}).
Le titre doit être accrocheur, vendeur, professionnel et court (maximum 5 à 10 mots).
Ne mets pas de guillemets, ni d'explication. Réponds UNIQUEMENT avec le nouveau titre.`;
    } else {
      systemPrompt = `Tu es un expert en copywriting pour la vente de produits numériques dans le monde entier. Tu écris des descriptions de produits convaincantes et professionnelles. Tu utilises du HTML pour le formatage (h2, h3, p, ul, li, strong, em). La description doit être engageante, structurée avec des sous-titres, des listes de bénéfices, et un appel à l'action. Ne mets pas de balise h1.`;
      userPrompt = `Récris et améliore cette description pour un ${typeLabel} intitulé "${title}".

Description actuelle : ${description || "(aucune description fournie, crée-en une de zéro)"}

Génère une description HTML riche, engageante et professionnelle qui donne envie d'acheter. Inclus :
- Un sous-titre accrocheur (h2)
- Une introduction captivante (1-2 paragraphes)
- Les bénéfices clés en liste (ul/li avec du texte en gras pour les points importants)
- Un appel à l'action final

Réponds UNIQUEMENT avec le HTML de la description, sans aucun commentaire.`;
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("GEMINI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: mode === "title" ? 0.9 : 0.7,
          max_tokens: mode === "title" ? 50 : 1500,
        }),
      },
    );

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ description: resultText.trim(), title: resultText.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
