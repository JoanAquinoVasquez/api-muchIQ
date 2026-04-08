import api from './api';

export interface AIRecommendationRequest {
  query: string;
  lat?: number;
  lng?: number;
}

export interface AIRecommendationResponse {
  aiResponse: string;
}

class AIService {
  // Coordenadas por defecto (Chiclayo, Lambayeque)
  private readonly DEFAULT_LAT = -6.7726085649176735;
  private readonly DEFAULT_LNG = -79.84632241544423;

  async getRecommendation(query: string, lat?: number, lng?: number): Promise<AIRecommendationResponse> {
    try {
      const requestData = {
        query: query,
        lat: lat || this.DEFAULT_LAT,
        lng: lng || this.DEFAULT_LNG,
      };

      console.log('📤 Enviando request a IA:', requestData);

      const response = await api.post<AIRecommendationResponse>('/api/ai/recommend', requestData);
      
      console.log('📥 Respuesta de IA:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en AI Service:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Error al obtener recomendación de IA'
      );
    }
  }

  async getChatResponse(message: string): Promise<string> {
    try {
      const response = await this.getRecommendation(message);
      return response.aiResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en el chat con IA');
    }
  }
}

export default new AIService();