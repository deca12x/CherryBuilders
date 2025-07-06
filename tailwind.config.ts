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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        white: "hsl(var(--white))",
        red: {
          DEFAULT: "hsl(var(--red))",
          foreground: "hsl(var(--red-foreground))",
        },
        green: {
          DEFAULT: "hsl(var(--green))",
          foreground: "hsl(var(--green-foreground))",
        },
        yellow: {
          DEFAULT: "hsl(var(--yellow))",
          foreground: "hsl(var(--yellow-foreground))",
        },
        grey: {
          DEFAULT: "hsl(var(--grey))",
          foreground: "hsl(var(--grey-foreground))",
        },
        "dark-grey": {
          DEFAULT: "hsl(var(--dark-grey))",
          foreground: "hsl(var(--dark-grey-foreground))",
        },
        zinc: {
          DEFAULT: "hsl(var(--zinc))",
          foreground: "hsl(var(--zinc-foreground))",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--white))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--red))",
          foreground: "hsl(var(--red-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--dark-grey))",
          foreground: "hsl(var(--dark-grey-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--grey))",
          foreground: "hsl(var(--grey-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--green))",
          foreground: "hsl(var(--green-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "reverse-spin": {
          from: {
            transform: "rotate(360deg)",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "reverse-spin": "reverse-spin 1s linear infinite",
      },
      transitionDuration: {
        "250": "250ms",
      },
      animationDuration: {
        "250": "250ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
};

export default config;
