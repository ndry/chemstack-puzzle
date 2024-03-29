import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import BuildInfo from 'vite-plugin-info';
import preact from "@preact/preset-vite";
import { VitePWA } from 'vite-plugin-pwa';
import { viteInlineLinkSvg } from "./vite-plugin-inlineLinkSvg";

export default defineConfig({
    build: {
        // minify: false,
    },
    resolve: {
        alias: {
            'react': 'preact/compat',
            'react-dom': 'preact/compat',
        },
    },
    plugins: [
        preact({
            devtoolsInProd: true,
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        }),
        BuildInfo(),
        VitePWA({
            injectRegister: 'inline',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            },
            manifest: {
                short_name: "ChemStack",
                name: "ChemStack Puzzle",
                start_url: "./?utm_source=web_app_manifest",
                display: "standalone",
                icons: [
                    {
                        src: './android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: './android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: './android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: './android-chrome-512x512-maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                ],
            }
        }),
        viteInlineLinkSvg(),
        viteSingleFile(),
        {
            name: "clean up svgr-ed svgs",
            enforce: "post",
            generateBundle(_, bundle) {
                const svgsToCleanUp = [
                    'src/tube.svg'
                ];

                for (const name of svgsToCleanUp) {
                    const key = Object.entries(bundle)
                        .find(([key, asset]) => asset.name === name)?.[0];
                    if (key) {
                        delete bundle[key];
                        console.log(
                            "clean up svgr-ed svgs:",
                            key, "removed from bundle");
                    } else {
                        console.log(
                            "clean up svgr-ed svgs:",
                            name, "not found in bundle");
                    }
                }
            },
        }
    ],
    server: {
        port: 3685,
    },
    base: "./",
});