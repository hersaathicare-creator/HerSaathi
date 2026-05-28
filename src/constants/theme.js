export const colors = {
  background: "#FFFFFF",
  white: "#FFFFFF",
  ink: "#1D1D1F",
  muted: "#6E6E73",
  placeholder: "#A1A1A6",
  lavender: "#F5F5F7",
  blush: "#FFFFFF",
  rose: "#7A3A8D",
  roseSoft: "#F7F7FA",
  plum: "#7A3A8D",
  mulberry: "#6F2B68",
  violet: "#8C5CF6",
  teal: "#1B9AAA",
  mint: "#F8F9FA",
  lemon: "#FAFAFA",
  coral: "#8E8E93",
  border: "#E5E5EA",
  cardShadow: "rgba(0,0,0,0.08)",
  success: "#3BA776",
  warning: "#B86A00"
};

export const layout = {
  screenPadding: 20,
  radius: 8,
  pillRadius: 999
};

export const fonts = {
  uiRegular: "Poppins_400Regular",
  uiMedium: "Poppins_500Medium",
  uiSemiBold: "Poppins_600SemiBold",
  uiBold: "Poppins_700Bold",
  uiExtraBold: "Poppins_800ExtraBold",
  premiumRegular: "DMSans_400Regular",
  premiumMedium: "DMSans_500Medium",
  premiumSemiBold: "DMSans_600SemiBold",
  premiumBold: "DMSans_700Bold"
};

export const typography = {
  brand: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.uiSemiBold,
    letterSpacing: 0,
    color: colors.ink
  },
  h1: {
    fontSize: 31,
    lineHeight: 39,
    fontFamily: fonts.premiumBold,
    letterSpacing: 0,
    color: colors.ink
  },
  h2: {
    fontSize: 23,
    lineHeight: 30,
    fontFamily: fonts.premiumBold,
    letterSpacing: 0,
    color: colors.ink
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.uiSemiBold,
    letterSpacing: 0,
    color: colors.ink
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.uiRegular,
    color: colors.ink
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.uiMedium,
    color: colors.ink
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.uiRegular,
    color: colors.muted
  },
  smallMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.uiMedium,
    color: colors.muted
  }
};

export const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: layout.radius,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.05,
  shadowRadius: 22,
  elevation: 2
};
