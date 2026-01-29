import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

interface HeaderProps {
  title: string;
  leftButton?: {
    icon?: string;
    text?: string;
    onPress: () => void;
  };
  rightButton?: {
    icon?: string;
    text?: string;
    onPress: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  leftButton,
  rightButton,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {leftButton && (
          <TouchableOpacity onPress={leftButton.onPress} style={styles.button}>
            <Text style={styles.buttonText}>
              {leftButton.icon || leftButton.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightButton && (
          <TouchableOpacity
            onPress={rightButton.onPress}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {rightButton.icon || rightButton.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.styles.h4,
    color: colors.text,
  },
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.styles.body,
    color: colors.primary,
  },
});
