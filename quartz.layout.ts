import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import Fireflies from "./quartz/components/Fireflies"
import RecentVisited from "./quartz/components/RecentVisited"
import TagsPanel from "./quartz/components/TagsPanel"
import SocialLinks from "./quartz/components/SocialLinks"

/**
 * Layout — 3-column con paneles izquierdos:
 *   LEFT  : page-title · search/controls · RecentVisited · RecentNotes · TagsPanel
 *   MAIN  : article
 *   RIGHT : explorer · TOC · backlinks
 *   MÓVIL : ☰ explorer en la barra superior · paneles debajo del artículo
 */

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Fireflies(),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/wyov",
    },
  }),
}

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
    Component.MobileOnly(Component.Explorer()),
    Component.DesktopOnly(RecentVisited()),
    Component.DesktopOnly(
      Component.RecentNotes({
        limit: 5,
        showTags: false,
        filter: (f) => f.frontmatter?.draft !== true,
      }),
    ),
    Component.DesktopOnly(TagsPanel()),
  ],
  right: [
    SocialLinks(),
    Component.DesktopOnly(Component.Explorer()),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks({ hideWhenEmpty: false }),
    Component.MobileOnly(RecentVisited()),
    Component.MobileOnly(
      Component.RecentNotes({
        limit: 5,
        showTags: false,
        filter: (f) => f.frontmatter?.draft !== true,
      }),
    ),
    Component.MobileOnly(TagsPanel()),
  ],
}

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
    Component.MobileOnly(Component.Explorer()),
    Component.DesktopOnly(RecentVisited()),
    Component.DesktopOnly(Component.RecentNotes({ limit: 5, showTags: false })),
    Component.DesktopOnly(TagsPanel()),
  ],
  right: [
    SocialLinks(),
    Component.DesktopOnly(Component.Explorer()),
    Component.MobileOnly(RecentVisited()),
    Component.MobileOnly(Component.RecentNotes({ limit: 5, showTags: false })),
    Component.MobileOnly(TagsPanel()),
  ],
}

