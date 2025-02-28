import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import postcss from 'postcss'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    postcss(),
  ],
  // extend:{
  //   backgroundImage:{
  //     'login-bg-img':"url('./src/assets/images/bg-image.jpg')",
  //     'signup-bg-img':"url('./src/assets/images/signup-bg-image.jpg')"
  
  //   },
  //   colors:{
  //     primary:"#05B6D3",
  //     secondary:"#EF863E"
  //   }
  // }

})