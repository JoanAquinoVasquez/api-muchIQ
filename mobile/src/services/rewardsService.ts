import api from './api';

export interface Partner {
  _id: string;
  name: string;
  category: string;
  address: string;
  longitude: number;
  latitude: number;
}

export interface Reward {
  _id: string;
  name: string;
  description: string;
  pointsCost: number;
  partnerId: string;
  stock: number;
  imageUrl?: string;
  partner?: Partner;
  discount?: string;
  validUntil?: string;
}

class RewardsService {
  async getRewards(): Promise<Reward[]> {
    try {
      const response = await api.get<Reward[]>('/api/rewards');

      // Enriquecer las recompensas con información adicional
      const enrichedRewards = response.data.map(reward => ({
        ...reward,
        discount: this.calculateDiscount(reward.pointsCost),
        validUntil: '31 Dic 2026',
        imageUrl: reward.imageUrl || this.getDefaultImage(reward.name),
      }));

      return enrichedRewards;
    } catch (error: any) {
      console.error('Error al obtener recompensas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener recompensas');
    }
  }

  async getPartners(): Promise<Partner[]> {
    try {
      const response = await api.get<Partner[]>('/api/partners');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener partners:', error);
      return [];
    }
  }

  async redeemReward(rewardId: string): Promise<{ success: boolean; qrCode: string }> {
    try {
      const response = await api.post(`/api/rewards/${rewardId}/redeem`);

      // Generar código QR único
      const qrData = `REWARD-${rewardId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        qrCode: qrData,
      };
    } catch (error: any) {
      console.error('Error al canjear recompensa:', error);
      throw new Error(error.response?.data?.message || 'Error al canjear recompensa');
    }
  }

  private calculateDiscount(pointsCost: number): string {
    // Calcular descuento basado en los puntos
    if (pointsCost >= 200) return '50%';
    if (pointsCost >= 150) return '40%';
    if (pointsCost >= 100) return '30%';
    if (pointsCost >= 50) return '20%';
    return '10%';
  }

  private getDefaultImage(rewardName: string): string {
    // Asignar imágenes por defecto según el nombre
    const name = rewardName.toLowerCase();

    if (name.includes('ceviche') || name.includes('comida') || name.includes('plato')) {
      return 'https://es.cravingsjournal.com/wp-content/uploads/2018/08/ceviche-con-leche-de-tigre-2.jpg';
    }
    if (name.includes('museo') || name.includes('cultura')) {
      return 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/cd/60/51/cartoline-da-citta-del.jpg?w=1200&h=-1&s=1';
    }
    if (name.includes('tour') || name.includes('turismo')) {
      return 'https://www.bbva.com/wp-content/uploads/2020/12/turismo_sostenible.jpg';
    }
    if (name.includes('café') || name.includes('cafeteria')) {
      return 'https://www.idbinvest.org/sites/default/files/styles/size936x656/public/blog_post/iStock_000043355764Small2.jpg.webp?itok=C2I_4rS3';
    }
    if (name.includes('artesanía') || name.includes('tienda')) {
      return 'https://www.eloriente.net/home/wp-content/uploads/2012/08/foto-artesan%C3%ADas.jpeg';
    }
    if(name.includes('pizza')){
      return 'https://www.papajohns.com.pe/media/catalog/product/a/g/agru_14358.png?optimize=medium&bg-color=255,255,255&fit=bounds&height=400&width=400&canvas=400:400&format=jpeg';
    }
    if(name.includes('pollo a la brasa')){
      return 'https://media-cdn.tripadvisor.com/media/photo-s/16/ed/64/5e/chaufa-brasa-perfecta.jpg';
    }
    if(name.includes('chaufa')){
      return 'https://www.paulinacocina.net/wp-content/uploads/2021/12/arroz-chaufa-peruano-receta.jpg';
    }
    
    // Imagen por defecto
    return 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800';
  }
}

export default new RewardsService();