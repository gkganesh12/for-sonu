// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// Render (or any root-hosted static host) needs no config; the GitHub Pages
// workflow sets BASE_PATH=/for-sonu and SITE_URL for project-page hosting.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://for-sonu.onrender.com',
  base: process.env.BASE_PATH ?? '/',
});
