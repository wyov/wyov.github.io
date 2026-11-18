import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

// @ts-ignore
import script from "./scripts/recentVisited.inline"

/**
 * RecentVisited — tracks the last 7 .md content pages visited by the user
 *
 * Excludes:
 *   · home (/)
 *   · about
 *   · folder/index pages (cheatsheets/, posts/)
 *   · tag pages
 *
 * Stored client-side in localStorage. Empty on first visit.
 */
const RecentVisited: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "recent-visited")}>
      <h3>Recent Visited</h3>
      <ul class="recent-visited-ul">
        <li class="empty-state">browse posts to track</li>
      </ul>
    </div>
  )
}

RecentVisited.afterDOMLoaded = script

export default (() => RecentVisited) satisfies QuartzComponentConstructor
