const { GoogleGenerativeAI } = require("@google/generative-ai");
const Place = require("../models/Place");
const Dish = require("../models/Dish"); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.getAIRecommendation = async (req, res) => {
  try {
    const { query, lat, lng } = req.body;
    const userTastes = req.user.tastes;
    const userEndDate = req.user.stayEndDate;

    if (!query || !lat || !lng) {
      return res
        .status(400)
        .json({ message: "Faltan datos (query, lat, lng)" });
    }

    const radiusInMeters = 10 * 1000;

    const nearbyPlaces = await Place.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    })
      .select("name description category tags rating") 
      .limit(20); 

    const nearbyDishes = await Dish.find({})
      .sort({ likes: -1 })
      .limit(10)
      .select("name description tags");

    const placesContext = JSON.stringify(nearbyPlaces);
    const dishesContext = JSON.stringify(nearbyDishes); 

    let itineraryInfo = ""; 
    if (
      userEndDate &&
      (query.toLowerCase().includes("itinerario") ||
        query.toLowerCase().includes("plan"))
    ) {
      const today = new Date();
      const endDate = new Date(userEndDate);
      const diffTime = Math.max(endDate.getTime() - today.getTime(), 0); 
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      itineraryInfo = `
    INFORMACIÓN DE ESTADÍA:
    - El usuario es turista y le quedan ${diffDays} días de estadía (hoy es ${today.toLocaleDateString(
        "es-ES"
      )}, se va el ${endDate.toLocaleDateString("es-ES")}).
    - La consulta pide un "itinerario" o "plan".
   `;
    }

    const prompt = `
   Eres "MuchIQ", un asistente de turismo experto y amigable de la app creada por MAGMA CREW en Lambayeque, Perú.
   Tu objetivo es dar una recomendación útil, corta y natural.
   
   CONTEXTO:
   - El usuario tiene estos gustos: ${userTastes.join(", ")}.
   - La consulta del usuario es: "${query}"
   - Lugares cercanos disponibles (JSON): ${placesContext}
   - Platos populares disponibles (JSON): ${dishesContext}

   ${itineraryInfo}

   TAREA:
   1. Analiza la consulta y los gustos del usuario.
   2. Revisa la lista de lugares y platos disponibles.
   3. Responde a la consulta del usuario de forma amigable **pero directa.**
   4. Recomienda 1 o 2 lugares o platos de la lista que mejor se adapten.
   5. Justifica brevemente por qué (ej. "basado en tus gustos...").
   6. ¡MUY IMPORTANTE!: Responde en el mismo idioma que la consulta del usuario. Si la consulta está en inglés, responde en inglés. Si es español, responde en español.
   7. NO inventes lugares o platos que no estén en las listas JSON.
   **8. Tu respuesta debe ser solo el texto para el usuario. ¡NO SALUDES! (No uses "Hola", "Claro", "Qué tal", etc.). Ve directo a la recomendación, ya que la app ya ha saludado al usuario.**
   9. Obligatoriamente debes dar la dirección del lugar o ubicación aproximada si recomiendas un lugar.
   10. ¡¡TAREA ESPECIAL!!: Si la consulta pide un "itinerario" (mira la INFORMACIÓN DE ESTADÍA):
    - Crea un itinerario sugerido (Día 1, Día 2, etc.) para los días de estadía restantes.
    - Distribuye los lugares de la lista JSON de forma lógica en ese itinerario (ej. un museo en la mañana, un restaurante para almorzar, una playa para el atardecer).
    - Si solo le queda 1 día, haz un plan para ese día.
   11. Si NO pide un itinerario, solo haz una recomendación simple de 1 o 2 lugares/platos.
  `; // 5. LLAMAR A LA IA

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiTextResponse = response.text(); // 6. DEVOLVER LA RESPUESTA

    res.status(200).json({
      aiResponse: aiTextResponse, // La respuesta de texto amigable // Opcional: podrías pedirle a la IA que también devuelva IDs // para que la app pueda navegar a ese lugar.
    });
  } catch (error) {
    console.error("Error en el controlador de IA:", error);
    res.status(500).json({ message: "Error en el servidor de IA" });
  }
};
