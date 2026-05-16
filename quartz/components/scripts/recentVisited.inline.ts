// =============================================================
//  recentVisited.inline.ts — tracking de páginas visitadas
// =============================================================
//
//  Guarda los últimos 7 posts .md visitados en localStorage.
//  Se ejecuta en cada SPA navigation (event "nav" de Quartz).
//
//  Filtros:
//    - excluye: home (/), about, /tags/*
//    - excluye folder/index pages (detectadas por ul.section-ul)
//    - solo trackea si hay <article> con contenido
// =============================================================

const STORAGE_KEY = "wyov-recent-visited"
const MAX_ITEMS = 10

interface VisitedItem {
  url: string
  title: string
  visited: number
}

function loadVisited(): VisitedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as VisitedItem[]) : []
  } catch {
    return []
  }
}

function saveVisited(items: VisitedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage podría estar deshabilitado, ignoramos
  }
}

function normalizePath(p: string): string {
  // Remover trailing slash excepto para raíz
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1)
  return p
}

function shouldTrack(): boolean {
  const path = normalizePath(window.location.pathname)

  // Excluir paths específicos
  if (path === "" || path === "/") return false
  if (path === "/about" || path.endsWith("/about")) return false

  // Excluir tag pages
  if (path.startsWith("/tags/") || path === "/tags") return false

  // Excluir folder/index pages — heurística:
  // las folder pages renderizan <ul class="section-ul">
  if (document.querySelector("ul.section-ul")) return false

  // Solo si hay un article real
  if (!document.querySelector("article")) return false

  return true
}

function getCurrentPageInfo(): VisitedItem | null {
  if (!shouldTrack()) return null

  const path = normalizePath(window.location.pathname)
  const titleEl = document.querySelector("h1.article-title")
  const title =
    titleEl?.textContent?.trim() ||
    document.title.split("—")[0].split("|")[0].trim()

  if (!title || title.length === 0) return null

  return { url: path, title, visited: Date.now() }
}

function trackVisit() {
  const info = getCurrentPageInfo()
  if (!info) return

  let items = loadVisited()
  // Remover si ya existe (lo movemos al frente)
  items = items.filter((item) => item.url !== info.url)
  // Agregar al frente
  items.unshift(info)
  // Limitar a MAX_ITEMS
  items = items.slice(0, MAX_ITEMS)
  saveVisited(items)
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return s.replace(/[&<>"']/g, (c) => map[c]!)
}

function renderVisited() {
  const ul = document.querySelector(".recent-visited-ul")
  if (!ul) return

  const items = loadVisited()

  if (items.length === 0) {
    ul.innerHTML = '<li class="empty-state">browse posts to track</li>'
    return
  }

  const currentPath = normalizePath(window.location.pathname)

  ul.innerHTML = items
    .map((item) => {
      const isCurrent = item.url === currentPath
      const activeAttr = isCurrent ? ' aria-current="page"' : ""
      return `<li class="recent-visited-li"><a href="${item.url}" class="internal"${activeAttr}>${escapeHtml(
        item.title,
      )}</a></li>`
    })
    .join("")
}

document.addEventListener("nav", () => {
  trackVisit()
  renderVisited()
})
