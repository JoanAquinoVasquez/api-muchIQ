const Reward = require('../models/Reward');
const User = require('../models/User');

exports.createReward = async (req, res) => {
  try {
    const { name, description, pointsCost, partnerId, stock } = req.body;
    
    const reward = new Reward({
      name,
      description,
      pointsCost,
      partner: partnerId,
      stock
    });

    const savedReward = await reward.save();
    res.status(201).json(savedReward);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// --- Controlador para OBTENER recompensas (filtradas por aliado) ---
exports.getRewards = async (req, res) => {
  try {
    let filter = {};
    if (req.query.partnerId) {
      filter.partner = req.query.partnerId;
    }

    const rewards = await Reward.find(filter).populate('partner', 'name category');
    res.status(200).json(rewards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// --- Controlador para CANJEAR una recompensa (¡PROTEGIDO!) ---
exports.redeemReward = async (req, res) => {
  try {
    const rewardId = req.params.id;
    const userId = req.user._id;

    const reward = await Reward.findById(rewardId);
    const user = await User.findById(userId);

    if (!reward) {
      return res.status(404).json({ message: 'Recompensa no encontrada' });
    }

    if (user.points < reward.pointsCost) {
      return res.status(400).json({ message: 'Puntos insuficientes' });
    }
    
    if (reward.stock <= 0) {
      return res.status(400).json({ message: 'Recompensa agotada' });
    }

    user.points -= reward.pointsCost;
    reward.stock -= 1; 

    await user.save();
    await reward.save();

    res.status(200).json({
      message: 'Recompensa canjeada con éxito',
      newPoints: user.points,
      confirmationCode: `C-${Date.now()}-${user._id.toString().slice(-4)}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};