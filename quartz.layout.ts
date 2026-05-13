import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import Fireflies from "./quartz/components/Fireflies"

/**
 * Layout 3-col integrado:
 *   LEFT   : page-title · search/controls · recent
 *   MAIN   : article
 *   RIGHT  : explorer · TOC · backlinks
 */

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    // Escena nocturna: canvas fijo con luciérnagas + pasto + fairy dust
    Fireflies(),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/wyov",
    },
  }),
}

// Posts y otras páginas de contenido
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
    Component.RecentNotes({
      limit: 5,
      showTags: false,
      filter: (f) => f.frontmatter?.draft !== true,
    }),
  ],
  right: [
    Component.Explorer(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// Folders y tag pages
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
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
      ],
    }),
    Component.RecentNotes({ limit: 5, showTags: false }),
  ],
  right: [
    Component.Explorer(),
  ],
}
