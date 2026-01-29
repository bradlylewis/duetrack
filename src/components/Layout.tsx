import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
  noPadding?: boolean;
  backgroundColor?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  style,
  useSafeArea = true,
  noPadding = false,
  backgroundColor = colors.background,
}) => {
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor },
        !noPadding && styles.withPadding,
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  withPadding: {
    paddingHorizontal: spacing.screenPadding,
  },
});
