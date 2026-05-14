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
    RecentVisited(),
    Component.RecentNotes({
      limit: 5,
      showTags: false,
      filter: (f) => f.frontmatter?.draft !== true,
    }),
    TagsPanel(),
  ],
  right: [
    SocialLinks(),
    Component.Explorer(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks({ hideWhenEmpty: false }),
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
    RecentVisited(),
    Component.RecentNotes({ limit: 5, showTags: false }),
    TagsPanel(),
  ],
  right: [
    SocialLinks(),
    Component.Explorer(),
  ],
}

