export const COLORS = {
  primary: '#2F5233',          // Deep forest green (header)
  primaryDark: '#1B4332',      // Darker green (sidebar background)
  secondary: '#386641',        // Medium forest green
  accent: '#A7C957',          // Light olive green
  background: '#1F3624',       // Softer dark green for dashboard background
  white: '#FFFFFF',
  text: '#F0F7F4',            // Off-white
  textLight: '#DDE5B6',       // Light sage
  border: '#40916C',          // Medium sage green
  error: '#E63946',           // Bright red
  success: '#386641',         // Medium forest green
  warning: '#F8B945',         // Warm yellow
  info: '#40916C',            // Medium sage green
  gradientStart: '#2F5233',   // Deep forest green
  gradientEnd: '#1F3624',     // Softer dark green
  drawer: {
    background: '#1B4332',    // Keeping the sidebar color you liked
    activeBackground: '#2F5233', // Deep forest green (matches primary)
    text: '#F0F7F4',          // Off-white
    activeText: '#FFFFFF',    // Pure white
    inactiveText: '#DDE5B6',  // Light sage
  },
  analyticsCards: {
    admins: '#A7C957',        // Light olive green
    products: '#588157',      // Sage green
    orders: '#3A5A40',        // Forest green
    users: '#344E41',         // Dark forest green
    pending: '#F8B945',       // Warm yellow
    notifications: '#E63946'   // Bright red
  }
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  padding: 15,
  margin: 10,
  radius: 12,
};

export const SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 4,
  },
  dark: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 6,
  },
};

export const FONTS = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
}; 