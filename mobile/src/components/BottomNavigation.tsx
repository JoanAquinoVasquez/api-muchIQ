import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../theme';

export default function BottomNavigation() {
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    { icon: 'home', label: 'Inicio', screen: 'Home' },
    { icon: 'compass', label: 'Explorar', screen: 'Explore' },
    { icon: 'gift', label: 'Premios', screen: 'Rewards' },
    { icon: 'person', label: 'Perfil', screen: 'Profile' },
  ];

  return (
    <View style={styles.navContainer}>
      <BlurView intensity={100} tint="dark" style={styles.navBlur}>
        <View style={styles.bottomNav}>
          {navItems.map((item, index) => {
            const isActive = route.name === item.screen;
            return (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => navigation.navigate(item.screen as never)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={(isActive ? item.icon : `${item.icon}-outline`) as any} 
                  size={24} 
                  color={isActive ? COLORS.accent : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.navLabel,
                  isActive && styles.navLabelActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.textLight + '20',
  },
  navBlur: {
    backgroundColor: COLORS.surface + 'CC',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  navLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.medium,
  },
  navLabelActive: {
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.semibold,
  },
});