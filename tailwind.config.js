/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        electric: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        charcoal: '#1F2937',
        'dark-bg': '#05050e',
      },
    },
  },
  corePlugins: require('tailwind-rn/unsupported-core-plugins'),
}
