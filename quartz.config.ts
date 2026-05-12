import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 — wyov-blog
 * Theme: Catppuccin Mocha OLED (fondo negro puro + paleta pastel)
 *
 * Customizable items:
 *   - pageTitle    : nombre visible del sitio
 *   - baseUrl      : dominio o subdominio donde se servirá
 *   - typography   : fuentes (default JetBrains Mono everywhere)
 *   - colors       : paleta dark (Catppuccin Mocha) y light (Latte)
 */

const config: QuartzConfig = {
  configuration: {
    pageTitle: "wyov.dev",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    // -----------------------------------------------------------------
    // baseUrl — IMPORTANTE para que assets carguen correctamente
    //
    // OPCIÓN A — User Pages (RECOMENDADA, default activo)
    //   Tu repo se llama "wyov.github.io"
    //   Sitio público:  https://wyov.github.io/
    //   Local serve:    http://localhost:8080/
    //
    // OPCIÓN B — Project Pages
    //   Tu repo se llama "wyov-blog" (o cualquier otro nombre)
    //   Sitio público:  https://wyov.github.io/wyov-blog/
    //   Local serve:    http://localhost:8080/wyov-blog/  (con subpath)
    //   Para usar esta opción, comentá la línea de abajo y descomentá la siguiente
    // -----------------------------------------------------------------
    baseUrl: "wyov.github.io",
    // baseUrl: "wyov.github.io/wyov-blog",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    generateSocialImages: false,
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "JetBrains Mono",
        body: "JetBrains Mono",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#eff1f5",        // Catppuccin Latte base
          lightgray: "#dce0e8",    // crust
          gray: "#8c8fa1",         // overlay1
          darkgray: "#4c4f69",     // text
          dark: "#4c4f69",
          secondary: "#8839ef",    // mauve
          tertiary: "#7287fd",     // lavender
          textHighlight: "#8839ef33",
        },
        darkMode: {
          light: "#000000",        // FONDO NEGRO PURO (OLED)
          lightgray: "#1a1a1a",    // separadores
          gray: "#7f849c",         // overlay1 - texto secundario
          darkgray: "#a6adc8",     // subtext0
          dark: "#cdd6f4",         // text (Catppuccin Mocha)
          secondary: "#cba6f7",    // mauve - acento principal
          tertiary: "#b4befe",     // lavender - hover
          textHighlight: "#cba6f733",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "catppuccin-latte",
          dark: "catppuccin-mocha",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
