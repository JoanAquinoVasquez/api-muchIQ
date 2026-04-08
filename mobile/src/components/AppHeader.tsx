import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../theme';

interface AppHeaderProps {
  user?: any;
  showRewards?: boolean;
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function AppHeader({ 
  user, 
  showRewards = true, 
  showLogout = true,
  onLogout 
}: AppHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <BlurView intensity={95} tint="dark" style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.userSection}
            onPress={() => navigation.navigate('Profile' as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'E'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.greeting} numberOfLines={1}>
                {user?.username || 'Explorador'}
              </Text>
              <View style={styles.pointsRow}>
                <Ionicons name="star" size={12} color={COLORS.accent} />
                <Text style={styles.points}>{user?.points || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {showRewards && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Rewards' as never)}
              >
                <Ionicons name="gift" size={22} color={COLORS.accent} />
              </TouchableOpacity>
            )}
            {showLogout && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={onLogout}
              >
                <Ionicons name="log-out-outline" size={22} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
  },
  headerBlur: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight + '20',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textWhite,
    marginBottom: 2,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.accent,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.bold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
});