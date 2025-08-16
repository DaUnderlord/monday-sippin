import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Monday Sippin' Brand Colors
      colors: {
        brand: {
          'deep-teal': '#1B4B5A',
          'warm-orange': '#F4A261',
          'rich-purple': '#6B46C1',
          'sage-green': '#52B788',
          'coral-pink': '#E76F51',
          // New violet-centric palette
          'violet-dark': '#5B46E0',
          'violet': '#7862F0',
          'violet-light': '#9B8CFF',
          'violet-tint': '#E7E3FF',
          'indigo-text': '#312e81',
          'surface': '#F7F7FB',
        },
        // Shadcn/ui color system
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      // Monday Sippin' Brand Gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1B4B5A 0%, #F4A261 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #6B46C1 0%, #E76F51 100%)',
        'gradient-accent': 'linear-gradient(135deg, #52B788 0%, #1B4B5A 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
        'gradient-cool': 'linear-gradient(135deg, #1B4B5A 0%, #6B46C1 100%)',
        'gradient-nature': 'linear-gradient(135deg, #52B788 0%, #F4A261 100%)',
        // Violet gradient aligned with brand logo color
        'gradient-violet': 'linear-gradient(135deg, #5B46E0 0%, #7862F0 50%, #9B8CFF 100%)',
      },
      // Typography - Manrope font family
      fontFamily: {
        sans: ['var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        manrope: ['var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'extra-light': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
      },
      // Border radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Animation and transitions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Spacing for consistent design
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;