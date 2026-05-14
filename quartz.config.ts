import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 — wyov-blog
 * Theme: Catppuccin Mocha OLED (fondo negro puro + paleta pastel)
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "wyov-offsec-notes",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "wyov.github.io",
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
          light: "#000000",        // OLED puro
          lightgray: "#1a1a1a",
          gray: "#7f849c",
          darkgray: "#a6adc8",
          dark: "#cdd6f4",
          secondary: "#cba6f7",    // mauve
          tertiary: "#b4befe",     // lavender
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
