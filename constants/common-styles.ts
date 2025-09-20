import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerAlign: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowStyle: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cardShadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  icon: {
    width: 20,
    height: 20,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  textSemiBold: {
    fontWeight: '600',
  },
  textMedium: {
    fontWeight: '500',
  },
  textSmall: {
    fontSize: 14,
  },
  textTiny: {
    fontSize: 12,
  },
  marginBottom8: {
    marginBottom: 8,
  },
  marginBottom12: {
    marginBottom: 12,
  },
  marginBottom16: {
    marginBottom: 16,
  },
  marginBottom20: {
    marginBottom: 20,
  },
  gap8: {
    gap: 8,
  },
  gap12: {
    gap: 12,
  },
  gap16: {
    gap: 16,
  },
  padding16: {
    padding: 16,
  },
  padding20: {
    padding: 20,
  },
  paddingHorizontal16: {
    paddingHorizontal: 16,
  },
  paddingHorizontal20: {
    paddingHorizontal: 20,
  },
  paddingVertical12: {
    paddingVertical: 12,
  },
  paddingVertical16: {
    paddingVertical: 16,
  },
});