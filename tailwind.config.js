
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./main.js",
    "./vistas/*.{html,js,css}"
  ],
  theme: {
    extend: {
      colors: {
        // Agregar colores personalizados
        'custom-blue': '#1DA1F2',
        'custom-gray': '#F7FAFC',
      },
      spacing: {
        // Agregar espaciados personalizados
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        // Agregar bordes redondeados personalizados
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
/* ./vistas/style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Puedes agregar estilos personalizados aquí */
body {
    font-family: 'Arial', sans-serif;

}