const { GoogleGenerativeAI } = require("@google/generative-ai");
const Place = require("../models/Place");
const Dish = require("../models/Dish"); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.getAIRecommendation = async (req, res) => {
  try {
    const { query, lat, lng, history } = req.body;
    const userTastes = req.user.tastes;
    const userEndDate = req.user.stayEndDate;

    if (!query) {
      return res
        .status(400)
        .json({ message: "Falta el campo query" });
    }

    let nearbyPlaces = [];
    let locationContextMessage = "Ubicación actual del usuario proporcionada.";

    if (lat && lng) {
      const radiusInMeters = 15 * 1000; // Aumentado a 15km para mejor cobertura
      nearbyPlaces = await Place.find({
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
        .select("name description category tags rating address")
        .limit(20);
    } else {
      // Si no hay ubicación, buscamos los lugares mejor puntuados de la región
      locationContextMessage = "El usuario NO ha compartido su ubicación exacta. Recomienda los lugares más importantes o populares de Lambayeque en general.";
      nearbyPlaces = await Place.find({})
        .sort({ rating: -1 })
        .select("name description category tags rating address")
        .limit(20);
    }

    const nearbyDishes = await Dish.find({})
      .sort({ likes: -1 })
      .limit(10)
      .select("name description tags");

    const placesContext = JSON.stringify(nearbyPlaces);
    const dishesContext = JSON.stringify(nearbyDishes); 

    let conversationContext = "";
    if (history && Array.isArray(history) && history.length > 0) {
      conversationContext = "HISTORIAL DE CONVERSACIÓN PREVIA:\n" + 
        history.map(m => `${m.isUser ? 'Usuario' : 'Asistente'}: ${m.text}`).join('\n') + "\n";
    }

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
    Eres "MuchIQ", el guía turístico oficial y planificador experto de la región Lambayeque, Perú. 
    Tu personalidad es la de un anfitrión apasionado por su tierra, amable, culto y siempre listo para planificar la mejor ruta turística para los visitantes.
    
    ${conversationContext}

    CONTEXTO ACTUAL (Basado en la ubicación y datos reales de la app):
    - ${locationContextMessage}
    - El usuario tiene estos gustos: ${userTastes.join(", ")}.
    - La consulta actual del usuario es: "${query}"
    - Lugares disponibles para recomendar (JSON): ${placesContext}
    - Platos típicos reales (JSON): ${dishesContext}

    ${itineraryInfo}

    TU MISIÓN:
    1. Actúa como un guía local que conoce cada rincón de Lambayeque.
    2. Si el usuario pide qué hacer, actúa como un PLANIFICADOR: diseña rutas lógicas (por ejemplo, visitar un museo y luego ir a comer cerca).
    3. Recomienda solo lugares de la lista JSON proporcionada para garantizar que existen en nuestra base de datos.
    4. Proporciona siempre la dirección exacta (campo "address") para que el turista no se pierda.
    5. Utiliza el historial para mantener la continuidad (ej. si recomendaron comida, ahora sugiere una caminata para después).
    6. ¡MUY IMPORTANTE!: Responde de forma concisa pero con entusiasmo. Usa el mismo idioma que el usuario.
    7. No saludes en respuestas de seguimiento para mantener la fluidez del chat.
    8. Si la consulta pide un itinerario: Organiza los días de forma estructurada destacando actividades imperdibles.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiTextResponse = response.text();

    res.status(200).json({
      aiResponse: aiTextResponse,
    });
  } catch (error) {
    console.error("Error en el controlador de IA:", error);
    res.status(500).json({ message: "Error en el servidor de IA" });
  }
};
