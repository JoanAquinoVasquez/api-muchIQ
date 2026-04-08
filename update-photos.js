const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Configuración
const MONGO_URI = process.env.MONGO_URI;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const CHICLAYO_LAT = -6.7713;
const CHICLAYO_LNG = -79.8409;

// Modelo Place (Mínimo necesario para actualizar)
const PlaceSchema = new mongoose.Schema({
  name: String,
  photos: [String],
  category: String
}, { strict: false });

const Place = mongoose.model('Place', PlaceSchema);

async function refreshGooglePhotos() {
  console.log('Conectando a MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a BD. Buscando lugares...');

  const places = await Place.find({});
  console.log(`Encontrados ${places.length} lugares para actualizar.`);

  let updatedCount = 0;

  for (const place of places) {
    console.log(`\nBuscando nuevas fotos para: "${place.name}"`);
    try {
      // Buscar el lugar en Google Places de nuevo
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(place.name)}&location=${CHICLAYO_LAT},${CHICLAYO_LNG}&radius=20000&key=${API_KEY}&language=es`;
      const response = await axios.get(searchUrl);
      
      const results = response.data.results;
      if (results && results.length > 0) {
        const match = results[0];
        if (match.photos && match.photos.length > 0) {
          const photoReference = match.photos[0].photo_reference;
          const freshPhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${API_KEY}`;
          
          place.photos = [freshPhotoUrl];
          await place.save();
          console.log(`✅ Foto actualizada: ${place.name}`);
          updatedCount++;
        } else {
          console.log(`⚠️ No se encontraron fotos en Google para: ${place.name}`);
        }
      } else {
        console.log(`❌ No se encontró el lugar en Google: ${place.name}`);
      }
    } catch (error) {
      console.error(`Error procesando ${place.name}:`, error.message);
    }

    // Esperar un poco para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 Proceso completado. Se actualizaron ${updatedCount} de ${places.length} lugares.`);
  mongoose.connection.close();
}

refreshGooglePhotos().catch(err => {
  console.error("Error fatal:", err);
  mongoose.connection.close();
});
