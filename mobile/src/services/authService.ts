import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  isTourist: boolean;
  reasonForVisit?: string;
  tastes?: string[];
}

// ✅ Estructura REAL de la respuesta de tu API
export interface ApiAuthResponse {
  _id: string;
  username: string;
  email: string;
  points: number;
  token: string;
  isTourist?: boolean;
  reasonForVisit?: string;
  tastes?: string[];
}

// Estructura interna de la app (para mantener compatibilidad)
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    isTourist: boolean;
    points: number;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiAuthResponse>(
        "/api/users/login",
        credentials,
      );

      console.log("Login response:", response.data); // Para debugging

      // ✅ Transformar la respuesta al formato interno
      const authData: AuthResponse = {
        token: response.data.token,
        user: {
          id: response.data._id,
          username: response.data.username,
          email: response.data.email,
          isTourist: response.data.isTourist || false,
          points: response.data.points || 0,
        },
      };

      // Guardar token y usuario
      await AsyncStorage.setItem("authToken", authData.token);
      await AsyncStorage.setItem("user", JSON.stringify(authData.user));

      return authData;
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);

      // Mensaje de error más descriptivo
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error al iniciar sesión";

      throw new Error(errorMessage);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiAuthResponse>(
        "/api/users/register",
        data,
      );

      console.log("Register response:", response.data); // Para debugging

      // ✅ Transformar la respuesta al formato interno
      const authData: AuthResponse = {
        token: response.data.token,
        user: {
          id: response.data._id,
          username: response.data.username,
          email: response.data.email,
          isTourist: response.data.isTourist || false,
          points: response.data.points || 0,
        },
      };

      // Guardar token y usuario
      await AsyncStorage.setItem("authToken", authData.token);
      await AsyncStorage.setItem("user", JSON.stringify(authData.user));

      return authData;
    } catch (error: any) {
      console.error("Register error:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error al registrarse";

      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
  }

  async getCurrentUser() {
    const userString = await AsyncStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }

  async updateCurrentUser(updates: Partial<AuthResponse["user"]>) {
    const userString = await AsyncStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem("authToken");
    return !!token;
  }
}

export default new AuthService();
