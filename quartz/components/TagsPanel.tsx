import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

/**
 * TagsPanel — lista de todos los tags del sitio
 *
 * Se renderiza en build-time. Cada tag muestra su nombre y va al
 * /tags/<tag> page. Ordenado por frecuencia descendente.
 */
const TagsPanel: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  // Contar frecuencia de cada tag
  const tagCounts = new Map<string, number>()
  for (const file of allFiles) {
    const tags = (file.frontmatter?.tags ?? []) as string[]
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  // Ordenar por count desc, después alfabético
  const sortedTags = [...tagCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )

  if (sortedTags.length === 0) {
    return null
  }

  return (
    <div class="tags-panel">
      <h3>Tags</h3>
      <ul class="tags-panel-ul tags">
        {sortedTags.map(([tag, count]) => {
          const linkDest = resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)
          return (
            <li>
              <a href={linkDest} class="internal tag-link" data-count={count}>
                {tag}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default (() => TagsPanel) satisfies QuartzComponentConstructor
