import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import typescript from "rollup-plugin-typescript2";
import tspCompiler from "ts-patch/compiler";

// https://vitejs.dev/config
export default defineConfig({
    esbuild: false,
    plugins: [
        { ...typescript({ typescript: tspCompiler }), enforce: "post" },
    ]
});
