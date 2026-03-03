const axios = require('axios');
require('dotenv').config(); // <-- ¡Importante!

const API_KEY = process.env.GOOGLE_PLACES_API_KEY; 
const TU_API_URL = 'http://localhost:5000/api/places';
const MAX_PAGES_PER_QUERY = 50; 

const CHICLAYO_LAT = -6.7713;
const CHICLAYO_LNG = -79.8409;
let totalAdded = 0;

const QUERIES = [
  'atractivos turisticos en Lambayeque, Chiclayo y Jose Leonardo Ortiz',
  'hoteles en la provincia de Chiclayo, Lambayeque, Jose Leonardo Ortiz',
  'museos en el distrito de Lambayeque',
  'restaurantes comida tipica en Chiclayo',
  'restaurantes comida tipica en Lambayeque',
  'parques y plazas en Chiclayo',
  'parques y plazas en Lambayeque',
  'playas de Lambayeque',
  'huacas en Lambayeque'
];
// ---------------------------------


async function getPlaceDetails(placeId) {
  const fields = 'editorial_summary';
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}&language=es`;
  try {
    const response = await axios.get(detailsUrl);
    if (response.data.result && response.data.result.editorial_summary) {
      return response.data.result.editorial_summary.overview;
    }
  } catch (error) {
    console.warn(`Advertencia: No se pudieron obtener detalles para ${placeId}`);
  }
  return null;
}


// --- 2. FUNCIÓN PARA BUSCAR EN GOOGLE (CON PAGINACIÓN) ---
async function fetchFromGoogle(query, pageToken = null) {
  console.log(pageToken ? `...Buscando siguiente página para "${query}"...` : `Buscando lugares en Google Places (Página 1) para: "${query}"`);

  let googleUrl;
  if (pageToken) {
    googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${API_KEY}`;
  } else {
    googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${CHICLAYO_LAT},${CHICLAYO_LNG}&radius=20000&key=${API_KEY}&language=es`;
  }

  try {
    if (pageToken) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    const response = await axios.get(googleUrl);
    return response.data; 
  } catch (error) {
    console.error("Error con la API de Google:", error.response?.data || error.message);
    return { results: [], next_page_token: null };
  }
}


// --- 3. FUNCIÓN PARA POBLAR NUESTRA BASE DE DATOS ---
async function populateOurDB(places) {
  console.log(`Se encontraron ${places.length} lugares en esta página. Procesando...`);
  let count = 0;

  for (const place of places) {

    let photosArray = [];
    if (place.photos && place.photos.length > 0) {
      const photoReference = place.photos[0].photo_reference;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${API_KEY}`;
      photosArray.push(photoUrl);
    }

    const realDescription = await getPlaceDetails(place.place_id);
    const finalDescription = realDescription || `Puntuación de Google: ${place.rating} (${place.user_ratings_total} reseñas). ${place.formatted_address}`;

    const newPlace = {
      name: place.name,
      description: finalDescription,
      category: place.types.includes('museum') ? 'museo' : (place.types.includes('restaurant') ? 'restaurante' : 'atractivo turístico'),
      address: place.formatted_address,
      longitude: place.geometry.location.lng,
      latitude: place.geometry.location.lat,
      tags: place.types,
      rating: place.rating || 3,
      numReviews: place.user_ratings_total || 0,
      photos: photosArray
    };

    // Intento de guardar en nuestra API
    try {
      await axios.post(TU_API_URL, newPlace, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`+ Se agregó: ${newPlace.name}`);
      count++;
    } catch (error) {
      console.error(`- Error al agregar ${newPlace.name}:`, error.response?.data?.message || error.message);
    }
  }
  console.log(`Se agregaron ${count} nuevos lugares de esta página.`);
  totalAdded += count;
}


// --- 4. MOTOR PRINCIPAL DEL SCRIPT (¡¡MODIFICADO!!) ---
async function runSeeder() {
  console.log('Iniciando seeder... Se procesarán múltiples búsquedas.');

  for (const query of QUERIES) {
    console.log(`\n======================================================`);
    console.log(`Iniciando búsqueda para: "${query}"`);
    console.log(`======================================================`);

    let currentPage = 1;
    let nextToken = null;

    let data = await fetchFromGoogle(query);
    await populateOurDB(data.results);
    nextToken = data.next_page_token;
    currentPage++;

    while (nextToken && currentPage <= MAX_PAGES_PER_QUERY) {
      console.log("--- Esperando 2 segundos para la siguiente página (requisito de Google) ---");
      data = await fetchFromGoogle(query, nextToken);
      await populateOurDB(data.results);
      nextToken = data.next_page_token;
      currentPage++;
    }
  }

  console.log(`\n¡POBLACIÓN COMPLETA! Se agregaron un total de ${totalAdded} lugares nuevos.`);
}

runSeeder();