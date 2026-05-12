import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import Fireflies from "./quartz/components/Fireflies"

/**
 * Quartz 4 — wyov-blog layout
 *
 * Three-column layout:
 *   [ LEFT sidebar ]  [ MAIN content ]  [ RIGHT sidebar ]
 *
 *   left:  search · darkmode toggle · explorer (file tree) · tags list
 *   main:  article content
 *   right: graph view · table of contents · backlinks
 *
 * Si querés ocultar algún panel, comentá el componente.
 * Si querés cambiar el orden, mové el componente arriba o abajo dentro del array.
 */

// Componentes compartidos en todas las páginas
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    // Escena nocturna animada (canvas fixed bottom)
    // Ver quartz/components/Fireflies.tsx y archivos relacionados
    Fireflies(),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/wyov",
      Mastodon: "https://infosec.exchange/@wyov",
      // "X / Twitter": "https://x.com/wyov",
    },
  }),
}

// Layout para páginas de contenido (posts individuales)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// Layout para páginas de lista (folder pages, tag pages)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
