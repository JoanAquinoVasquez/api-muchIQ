require('dotenv').config();
const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  name: String,
  description: String,
  pointsCost: Number,
  partner: mongoose.Schema.Types.ObjectId,
  stock: Number,
  discount: String
}, { strict: false });

const Reward = mongoose.model('Reward', RewardSchema);

async function fixRewards() {
  try {
    console.log('Conectando a MongoDB para corregir etiquetas de descuento...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const rewards = await Reward.find({});
    let updatedCount = 0;

    for (let reward of rewards) {
      let nameLower = reward.name.toLowerCase();
      let assignedDiscount = '';

      if (nameLower.includes('gratis')) {
        assignedDiscount = 'GRATIS';
      } else {
        // Buscar si dice '15%', '20%', etc. en el nombre
        let match = nameLower.match(/(\d+)%/);
        if (match) {
          assignedDiscount = match[1] + '% OFF'; // Extrae el número y le pone % OFF
        } else {
          // Si no tiene lógica de gratis ni porcentaje, le ponemos uno general o "2x1"
          assignedDiscount = 'Oferta Especial';
        }
      }

      reward.discount = assignedDiscount;
      await reward.save();
      updatedCount++;
      console.log(`Corregido: ${reward.name} -> Discount: ${assignedDiscount}`);
    }

    console.log(`Corrección completada en ${updatedCount} recompensas.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB.');
  }
}

fixRewards();
