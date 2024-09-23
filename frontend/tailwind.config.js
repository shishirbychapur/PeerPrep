/** @type {import('tailwindcss').Config} */

module.exports = {
    darkMode: ['class'],
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            width: {
                dashboard: '49.5%',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            colors: {
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
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                },
                btn: {
                    DEFAULT: 'hsl(var(--theme-600))',
                    primary: 'hsl(var(--theme-600))',
                    secondary: 'hsl(var(--white))',
                    hover: 'hsl(var(--hover-fill))',
                    foreground: 'hsl(var(--foreground))',
                },
                theme: {
                    100: 'hsl(var(--theme-100))',
                    400: 'hsl(var(--theme-400))',
                    600: 'hsl(var(--theme-600))',
                    900: 'hsl(var(--theme-900))',
                },
            },
            height: {
                fullscreen: 'calc(100vh - 3rem)',
            },
            maxHeight: {
                oneThirdScreen: 'calc((100vh - 3rem) / 3)',
                twoFifthScreen: 'calc((100vh - 3rem) / 2.5)',
            },
            height: {
                fullscreen: 'calc(100vh - 3rem)',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
}
