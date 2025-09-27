// Accessibility utility functions for ensuring proper contrast

export const getContrastCompliantColors = () => ({
  // Text colors for light backgrounds (WCAG AA compliant)
  text: {
    primary: 'text-gray-900', // #111827
    secondary: 'text-gray-800', // #1f2937
    tertiary: 'text-gray-700', // #374151
    muted: 'text-gray-600', // #4b5563
    light: 'text-gray-500', // #6b7280 (use sparingly)
  },

  // Text colors for dark backgrounds
  darkBg: {
    primary: 'text-white',
    secondary: 'text-gray-100',
    tertiary: 'text-gray-200',
  },

  // Badge colors with proper contrast
  badges: {
    success: 'bg-green-50 text-green-900 border-green-200',
    error: 'bg-red-50 text-red-900 border-red-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
    default: 'bg-gray-50 text-gray-900 border-gray-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
  },

  // Button colors with proper contrast
  buttons: {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-800 text-white',
    success: 'bg-green-700 hover:bg-green-800 text-white',
    danger: 'bg-red-700 hover:bg-red-800 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    outline: 'border-gray-700 text-gray-900 hover:bg-gray-100',
  },

  // Status indicators
  status: {
    correct: {
      bg: 'bg-green-50',
      text: 'text-green-900',
      border: 'border-green-300',
    },
    incorrect: {
      bg: 'bg-red-50',
      text: 'text-red-900',
      border: 'border-red-300',
    },
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      border: 'border-yellow-300',
    },
    partial: {
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      border: 'border-orange-300',
    },
  },
});

// Get contrast-safe text color based on background
export const getTextColorForBackground = (bgColor: string): string => {
  const colorMap: { [key: string]: string } = {
    // Light backgrounds
    'bg-white': 'text-gray-900',
    'bg-gray-50': 'text-gray-900',
    'bg-gray-100': 'text-gray-900',
    'bg-blue-50': 'text-blue-900',
    'bg-blue-100': 'text-blue-900',
    'bg-green-50': 'text-green-900',
    'bg-green-100': 'text-green-900',
    'bg-red-50': 'text-red-900',
    'bg-red-100': 'text-red-900',
    'bg-yellow-50': 'text-yellow-900',
    'bg-yellow-100': 'text-yellow-900',
    'bg-purple-50': 'text-purple-900',
    'bg-purple-100': 'text-purple-900',
    'bg-orange-50': 'text-orange-900',
    'bg-orange-100': 'text-orange-900',
    'bg-indigo-50': 'text-indigo-900',
    'bg-indigo-100': 'text-indigo-900',

    // Dark backgrounds
    'bg-gray-800': 'text-white',
    'bg-gray-900': 'text-white',
    'bg-blue-700': 'text-white',
    'bg-blue-800': 'text-white',
    'bg-blue-900': 'text-white',
    'bg-green-700': 'text-white',
    'bg-green-800': 'text-white',
    'bg-green-900': 'text-white',
    'bg-red-700': 'text-white',
    'bg-red-800': 'text-white',
    'bg-red-900': 'text-white',
  };

  return colorMap[bgColor] || 'text-gray-900';
};

// Get accessible badge styles based on status
export const getAccessibleBadgeStyles = (status: string): string => {
  const styles: { [key: string]: string } = {
    'CORRECT': 'bg-green-50 text-green-900 border border-green-300',
    'INCORRECT': 'bg-red-50 text-red-900 border border-red-300',
    'PENDING': 'bg-yellow-50 text-yellow-900 border border-yellow-300',
    'PARTIAL': 'bg-orange-50 text-orange-900 border border-orange-300',
    'PARTIALLY_CORRECT': 'bg-orange-50 text-orange-900 border border-orange-300',
    'default': 'bg-gray-50 text-gray-900 border border-gray-300',
  };

  return styles[status] ?? styles['default'] ?? 'bg-gray-50 text-gray-900 border border-gray-300';
};

// Ensure minimum font sizes for readability
export const getAccessibleFontSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'): string => {
  const sizes = {
    'xs': 'text-sm', // Minimum 14px instead of 12px
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
  };

  return sizes[size];
};

// Add focus indicators for keyboard navigation
export const getFocusStyles = (): string => {
  return 'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2';
};

// Get accessible link styles
export const getAccessibleLinkStyles = (variant: 'default' | 'nav' | 'footer' = 'default'): string => {
  const styles = {
    'default': 'text-blue-700 hover:text-blue-900 underline decoration-2 underline-offset-2',
    'nav': 'text-gray-900 hover:text-blue-700 font-medium',
    'footer': 'text-gray-700 hover:text-gray-900',
  };

  return `${styles[variant]} ${getFocusStyles()}`;
};