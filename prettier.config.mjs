/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tabWidth: 2,
  // Tailwind v4 has no tailwind.config.js; point the plugin at the stylesheet instead.
  tailwindStylesheet: "./src/styles.css",
  overrides: [{ files: "*.html", options: { parser: "angular" } }],
};
