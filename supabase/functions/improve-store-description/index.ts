import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { description, storeName } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Description vide" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (description.length > 20000) {
      return new Response(JSON.stringify({ error: "Description trop longue (max 20 000 caractères)" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Clé d'API IA non configurée sur le serveur" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Tu es un expert en copywriting et marketing e-commerce d'élite.
Le créateur de la boutique "${storeName || "inconnue"}" te fournit une description de sa boutique (qui peut être très courte, comme "vente de produits", ou mal rédigée).
Ta mission : Transformer ce texte brut en une description de boutique ultra-professionnelle, vendeuse, engageante et parfaitement structurée en HTML.

RÈGLES STRICTES :
- Si le texte fourni est très court (ex: "vente de chaussure"), DÉVELOPPE-LE considérablement pour en faire un texte professionnel de présentation de boutique. Invente une structure pertinente (Qui sommes-nous, Nos garanties, Pourquoi nous choisir).
- Si le texte est déjà long, AMÉLIORE la formulation, corrige les fautes de français, enrichis le vocabulaire et rends le texte plus accrocheur et persuasif.
- Structure le contenu avec du HTML propre et sémantique : utilise <h1> pour le titre de bienvenue principal, <h2> pour les grandes sections, <p> pour les paragraphes, et <ul><li> pour les listes de bénéfices.
- Ajoute des emojis pertinents avec parcimonie pour rendre le texte vivant, dynamique et dans l'air du temps.
- Si l'utilisateur a mis des liens ou des images, conserve-les IMPÉRATIVEMENT.
- Ne mentionne jamais que tu es une IA, agis comme le rédacteur pro de la boutique.
- Ton but est que le visiteur de la boutique ait envie d'acheter après avoir lu cette description.

RÉPONDS UNIQUEMENT AVEC LE CODE HTML GÉNÉRÉ DE LA DESCRIPTION, sans markdown de code (pas de \`\`\`html), sans aucun commentaire avant ou après.`;

    const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description },
        ],
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: "Crédits IA épuisés. Contactez l'administrateur." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      return new Response(JSON.stringify({ error: `Erreur API IA (${aiResponse.status}): ${t.substring(0, 100)}` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResponse.json();
    let improved: string = data.choices?.[0]?.message?.content || "";

    // Strip accidental markdown code fences
    improved = improved.trim()
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    if (!improved) {
      return new Response(JSON.stringify({ error: "L'IA a renvoyé une réponse vide." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ improved }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("improve-store-description error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue du serveur" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
