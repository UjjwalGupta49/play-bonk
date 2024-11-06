import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'border-glow-green': {
  				'0%, 100%': {
  					boxShadow: '0 0 5px #2DE76E, 0 0 10px #2DE76E, 0 0 15px #2DE76E',
  				},
  				'50%': {
  					boxShadow: '0 0 10px #2DE76E, 0 0 20px #2DE76E, 0 0 25px #2DE76E',
  				},
  			},
  			'border-glow-red': {
  				'0%, 100%': {
  					boxShadow: '0 0 5px #E72D36, 0 0 10px #E72D36, 0 0 15px #E72D36',
  				},
  				'50%': {
  					boxShadow: '0 0 10px #E72D36, 0 0 20px #E72D36, 0 0 25px #E72D36',
  				},
  			},
  			'border-glow-yellow': {
  				'0%, 100%': {
  					boxShadow: '0 0 5px #ffe135, 0 0 10px #ffe135, 0 0 15px #ffe135',
  				},
  				'50%': {
  					boxShadow: '0 0 10px #ffe135, 0 0 20px #ffe135, 0 0 25px #ffe135',
  				},
  			},
  		},
  		animation: {
  			'border-glow-green': 'border-glow-green 1.5s ease-in-out infinite',
  			'border-glow-red': 'border-glow-red 1.5s ease-in-out infinite',
  			'border-glow-yellow': 'border-glow-yellow 1.5s ease-in-out infinite',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
