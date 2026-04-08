const Place = require('../models/Place');
const User = require('../models/User');

// --- Controlador para CREAR un nuevo lugar (para pruebas/admin) ---
exports.createPlace = async (req, res) => {
    try {
        const { name, description, category, address, longitude, latitude, tags, photos, rating, numReviews } = req.body;

        const location = {
            type: 'Point',
            coordinates: [longitude, latitude] // ¡Importante! [Longitud, Latitud]
        };

        const place = new Place({
            name,
            description,
            category,
            address,
            location,
            tags,
            photos,
            rating,
            numReviews
        });

        const savedPlace = await place.save();
        res.status(201).json(savedPlace);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al crear lugar' });
    }
};

// --- Controlador para OBTENER lugares ---
exports.getPlaces = async (req, res) => {
    try {
        const { category, tag, lat, lng, radius } = req.query;

        let filter = {};

        if (category) {
            filter.category = category;
        }

        if (tag) {
            filter.tags = { $in: [tag] };
        }

        // --- FILTRO GEOESPACIAL ---
        if (lat && lng && radius) {
            const radiusInMeters = parseFloat(radius) * 1000;
            const longitude = parseFloat(lng);
            const latitude = parseFloat(lat);

            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radiusInMeters
                }
            };
        }
        const places = await Place.find(filter);

        res.status(200).json(places);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al obtener lugares' });
    }
};


// --- Controlador para OBTENER UN SOLO LUGAR por ID ---
exports.getPlaceById = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);

        if (place) {
            res.json(place);
        } else {
            res.status(404).json({ message: 'Lugar no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// --- Controlador para EDITAR/ACTUALIZAR un lugar ---
exports.updatePlace = async (req, res) => {
    try {
        const placeId = req.params.id;
        const updateData = req.body;

        // Validamos si nos envían longitud y latitud nuevas para rehacer el objeto GeoJSON
        if (updateData.longitude && updateData.latitude) {
            updateData.location = {
                type: 'Point',
                coordinates: [updateData.longitude, updateData.latitude]
            };
        }

        const updatedPlace = await Place.findByIdAndUpdate(
            placeId,
            { $set: updateData },
            { new: true, runValidators: true } // new: true devuelve el objeto ya actualizado
        );

        if (!updatedPlace) {
            return res.status(404).json({ message: 'Lugar no encontrado para actualizar' });
        }

        res.status(200).json(updatedPlace);

    } catch (error) {
        console.error('Error al actualizar lugar:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el lugar' });
    }
};

// --- Controlador para CREAR UNA RESEÑA (y ganar puntos) ---
exports.createPlaceReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const placeId = req.params.id;

        const place = await Place.findById(placeId);
        if (!place) {
            return res.status(404).json({ message: 'Lugar no encontrado' });
        }

        const alreadyReviewed = place.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Ya has hecho una reseña de este lugar' });
        }

        const review = {
            name: req.user.username,
            rating: Number(rating),
            comment: comment || '', // Si no hay comentario, string vacío
            user: req.user._id,
        };

        place.reviews.push(review);
        place.numReviews = place.reviews.length;

        place.rating =
            place.reviews.reduce((acc, item) => item.rating + acc, 0) /
            place.reviews.length;

        await place.save();

        const user = await User.findById(req.user._id);
        user.points = (user.points || 0) + 10; // Gana 10 puntos por reseña
        await user.save();

        res.status(201).json({
            message: 'Reseña añadida con éxito',
            newPoints: user.points
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};