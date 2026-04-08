import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@screens/WelcomeScreen';
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import HomeScreen from '@screens/HomeScreen';
import PlaceDetailScreen from '@screens/PlaceDetailScreen';
import RewardsScreen from '@screens/RewardsScreen';
import ProfileScreen from '@screens/ProfileScreen';
import NearbyScreen from '@screens/NearbyScreen';
import CategoryPlacesScreen from '@screens/CategoryPlacesScreen';
import AIAssistantScreen from '@screens/AIAssistantScreen';
import ExploreScreen from '@screens/ExploreScreen';
import DishDetailScreen from '@screens/DishDetailScreen';
import EditProfileScreen from '@screens/EditProfileScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  PlaceDetail: { placeId: string };
  Rewards: undefined;
  Profile: undefined;
  Nearby: undefined;
  CategoryPlaces: { category: string };
  AIAssistant: undefined;
  Explore: undefined;
  DishDetail: { dishId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F8F9FA' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Nearby" component={NearbyScreen} />
      <Stack.Screen name="CategoryPlaces" component={CategoryPlacesScreen} />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}