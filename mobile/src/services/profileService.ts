import api from './api';

export interface VisitedPlace {
  _id: string;
  name: string;
  category: string;
  photos: string[];
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  points: number;
  tastes: string[];
  isTourist: boolean;
  stayEndDate: string;
  visitedPlaces: VisitedPlace[];
}

class ProfileService {
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>('/api/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al cargar perfil');
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await api.put<UserProfile>('/api/users/profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  }
}

export default new ProfileService();