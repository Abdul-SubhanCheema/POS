import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6F7FF',
      100: '#BAE7FF',
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#1890FF',
      600: '#096DD9',
      700: '#0050B3',
      800: '#003A8C',
      900: '#002766',
    },
    secondary: {
      50: '#F6FFED',
      100: '#D9F7BE',
      200: '#B7EB8F',
      300: '#95DE64',
      400: '#73D13D',
      500: '#52C41A',
      600: '#389E0D',
      700: '#237804',
      800: '#135200',
      900: '#092B00',
    },
    accent: {
      50: '#FFF2E8',
      100: '#FFD8BF',
      200: '#FFBB96',
      300: '#FF9C6E',
      400: '#FF7A45',
      500: '#FA541C',
      600: '#D4380D',
      700: '#AD2102',
      800: '#871400',
      900: '#610B00',
    },
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    }
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
      },
      sizes: {
        lg: {
          fontSize: 'md',
          px: 8,
          py: 4,
        },
      },
      variants: {
        solid: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
          },
          transition: 'all 0.2s',
        },
        outline: {
          borderWidth: '2px',
          _hover: {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          transition: 'all 0.2s',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: '0 4px 25px rgba(0, 0, 0, 0.1)',
          _hover: {
            boxShadow: '0 8px 35px rgba(0, 0, 0, 0.15)',
          },
          transition: 'all 0.3s',
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: 'lg',
            borderWidth: '2px',
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme;