const CONFIG = {
  // ----- Luciérnagas -----
  fireflyCount: window.innerWidth < 600 ? 5 : 9,    // v4.1: mitad (era 10/18)
  fireflyColors: ["#f9e2af", "#fab387", "#f5e0dc"],
  fireflyAreaTop: 0.30,

  // ----- Pasto -----
  grassBlades: window.innerWidth < 600 ? 180 : 320,

  // ----- Fairy dust -----
  fairyDustCount: window.innerWidth < 600 ? 18 : 35,    // v4.4: mitad (era 35/70)
  fairyDustColors: ["#cba6f7", "#b4befe", "#f5c2e7", "#c8a4ec"],
  fairyDustMaxOpacity: 0.55,
}

// 4 variantes de color por brizna — del más oscuro al más claro.
// El último (catppuccin highlight) aparece sólo en ~8% de briznas.
const GRASS_VARIANTS = [
  { base: "#03080a", mid: "#1a3a0c", tip: "#5e9550" },
  { base: "#050d05", mid: "#2d5510", tip: "#7cb86a" },
  { base: "#050a08", mid: "#3a6014", tip: "#94c47a" },
  { base: "#080c05", mid: "#4a7018", tip: "#a6e3a1" },
]

// Paleta de grises + matices brown/blue para piedras del sendero.
// Mezcla de tonos para que no sea un sendero uniforme.
const STONE_COLORS = [
  "#2a2a2a", "#363636", "#454545",   // gris oscuro
  "#525252", "#5e5e5e", "#6a6a6a",   // gris medio
  "#5a5654", "#48423e",              // gris-marrón
  "#3e4244", "#4e5254",              // gris-azulado
]

document.addEventListener("nav", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const canvas = document.querySelector<HTMLCanvasElement>(".fireflies-canvas")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // -----------------------------------------------------------
  // Resize + DPR
  // -----------------------------------------------------------
  let W = 0
  let H = 0
  let DPR = window.devicePixelRatio || 1

  function resize() {
    const parent = canvas!.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    W = rect.width
    H = rect.height
    DPR = window.devicePixelRatio || 1
    canvas!.width = W * DPR
    canvas!.height = H * DPR
    canvas!.style.width = W + "px"
    canvas!.style.height = H + "px"
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
    // Orden importa: pathBounds + pathFadeWidth listos antes de createGrass
    pathBounds = getPathBounds()
    const pathW = pathBounds.right - pathBounds.left
    pathFadeWidth = pathW > 0 ? Math.min(38, pathW * 0.08) : 0
    grass = createGrass()
    stones = createStones()
    pathSprite = createPathSprite()
  }

  const onResize = () => resize()
  window.addEventListener("resize", onResize, { passive: true })

  // -----------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------
  const rand = (min: number, max: number) => min + Math.random() * (max - min)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "")
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    }
  }

  // -----------------------------------------------------------
  // PATH BOUNDS — mide la columna .center del page
  // -----------------------------------------------------------
  //
  // Lee la posición/ancho real de la columna de lectura desde el DOM.
  // Si no existe (edge case), cae a un cálculo basado en breakpoints
  // del layout (matching section I del custom.scss: 1800px / 400px / 280px).
  // -----------------------------------------------------------
  let pathBounds = { left: 0, right: 0 }
  // pathFadeWidth — compartido entre createPathSprite y createGrass:
  //   · drawPath usa pathFadeWidth para el difuminado horizontal
  //   · createGrass excluye briznas SOLO de la zona sólida (no del fade),
  //     dejando que el pasto crezca naturalmente en la intersección
  let pathFadeWidth = 0

  function getPathBounds() {
    // Extensión: el sendero se alarga 37px a cada lado más allá de .center
    // para alcanzar el BORDE INTERNO de los paneles del sidebar.
    //   = sidebar padding (2rem = 32px) + grid gap (5px) = 37px
    // Total: +74px = ~7.5% más ancho que .center
    const extension = 37

    const center = document.querySelector<HTMLElement>(".page > #quartz-body > .center")
    if (center) {
      const rect = center.getBoundingClientRect()
      if (rect.width > 100) {
        return {
          left: rect.left - extension,
          right: rect.right + extension,
        }
      }
    }
    // Fallback — calcular desde breakpoints conocidos
    const pageWidth = Math.min(W, 1800)
    const pageX = (W - pageWidth) / 2
    let sidebarW = 400
    if (W < 1201 && W >= 1024) sidebarW = 280
    if (W < 1024) sidebarW = 0
    if (sidebarW === 0) return { left: 0, right: W }
    return {
      left: pageX + sidebarW + 5 - extension,
      right: W - (pageX + sidebarW + 5 - extension),
    }
  }

  // -----------------------------------------------------------
  // STONES — piedras del sendero
  // -----------------------------------------------------------
  type Stone = {
    x: number
    y: number
    rx: number              // radio horizontal
    ry: number              // radio vertical (más chato)
    rotation: number
    color: string
    points: number[]        // factor de irregularidad por vértice (8 puntos)
    highlight: boolean      // ~40% tienen brillo arriba
  }

  function createStones(): Stone[] {
    const result: Stone[] = []
    if (pathBounds.left >= pathBounds.right) return result

    const width = pathBounds.right - pathBounds.left
    const density = window.innerWidth < 600 ? 14 : 17   // 1 piedra cada N px
    const count = Math.floor(width / density)

    for (let i = 0; i < count; i++) {
      const x = rand(pathBounds.left + 2, pathBounds.right - 2)
      const y = H - rand(2, 14)
      const rx = rand(3, 9)
      const ry = rx * rand(0.45, 0.75)               // chatas para verse desde arriba
      const points: number[] = []
      for (let j = 0; j < 8; j++) points.push(rand(0.82, 1.18))
      result.push({
        x, y, rx, ry,
        rotation: rand(0, Math.PI * 2),
        color: pick(STONE_COLORS),
        points,
        highlight: Math.random() < 0.4,
      })
    }
    return result
  }

  let stones: Stone[] = []

  // pathSprite — offscreen canvas pre-computado con el strip del sendero.
  //
  // Se genera UNA vez (en resize) con dos capas combinadas:
  //   1) Gradiente vertical earth-tone (transparente arriba → opaco abajo)
  //   2) Máscara horizontal vía destination-in: fade-in left + fade-out right
  //
  // Usar offscreen canvas aísla el destination-in para que solo afecte
  // al strip del path, no al soil que está dibujado abajo en el canvas
  // principal. Resultado: bordes laterales suavizados, soil intacto.
  let pathSprite: HTMLCanvasElement | null = null

  function createPathSprite(): HTMLCanvasElement | null {
    if (pathBounds.left >= pathBounds.right) return null

    const pathW = Math.ceil(pathBounds.right - pathBounds.left)
    const pathHeight = 18
    const fadeWidth = pathFadeWidth   // viene calculado desde resize()

    const off = document.createElement("canvas")
    off.width = pathW * DPR
    off.height = pathHeight * DPR
    const offCtx = off.getContext("2d")
    if (!offCtx) return null
    offCtx.scale(DPR, DPR)

    // 1) Gradiente vertical — earth-tone, transparente arriba
    const vGrad = offCtx.createLinearGradient(0, 0, 0, pathHeight)
    vGrad.addColorStop(0, "rgba(38, 28, 20, 0)")
    vGrad.addColorStop(0.5, "rgba(38, 28, 20, 0.45)")
    vGrad.addColorStop(1, "rgba(40, 30, 22, 0.72)")
    offCtx.fillStyle = vGrad
    offCtx.fillRect(0, 0, pathW, pathHeight)

    // 2) Máscara horizontal — destination-in mantiene solo donde
    //    la mask tiene alpha > 0. Los extremos (alpha 0) se eliminan.
    offCtx.globalCompositeOperation = "destination-in"
    const fadeRatio = fadeWidth / pathW
    const hMask = offCtx.createLinearGradient(0, 0, pathW, 0)
    hMask.addColorStop(0, "rgba(0, 0, 0, 0)")
    hMask.addColorStop(fadeRatio, "rgba(0, 0, 0, 1)")
    hMask.addColorStop(1 - fadeRatio, "rgba(0, 0, 0, 1)")
    hMask.addColorStop(1, "rgba(0, 0, 0, 0)")
    offCtx.fillStyle = hMask
    offCtx.fillRect(0, 0, pathW, pathHeight)

    return off
  }

  function drawPath() {
    if (!pathSprite) return
    const pathW = pathBounds.right - pathBounds.left
    ctx!.drawImage(pathSprite, pathBounds.left, H - 18, pathW, 18)
  }

  function drawStones() {
    for (const s of stones) {
      // Sombra sutil debajo (da sensación de relieve)
      ctx!.fillStyle = "rgba(0, 0, 0, 0.4)"
      ctx!.beginPath()
      ctx!.ellipse(s.x + 0.5, s.y + 1, s.rx * 1.05, s.ry * 0.5, 0, 0, Math.PI * 2)
      ctx!.fill()

      // Cuerpo de piedra: polígono irregular de 8 vértices
      ctx!.fillStyle = s.color
      ctx!.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + s.rotation
        const r = s.points[i]
        const px = s.x + Math.cos(angle) * s.rx * r
        const py = s.y + Math.sin(angle) * s.ry * r
        if (i === 0) ctx!.moveTo(px, py)
        else ctx!.lineTo(px, py)
      }
      ctx!.closePath()
      ctx!.fill()

      // Highlight superior (efecto de luz cenital)
      if (s.highlight) {
        ctx!.fillStyle = "rgba(255, 255, 255, 0.08)"
        ctx!.beginPath()
        ctx!.ellipse(
          s.x - s.rx * 0.25, s.y - s.ry * 0.35,
          s.rx * 0.45, s.ry * 0.3,
          s.rotation, 0, Math.PI * 2,
        )
        ctx!.fill()
      }
    }
  }

  // -----------------------------------------------------------
  // GRASS — 4 capas + viento como onda viajera
  // -----------------------------------------------------------
  type Blade = {
    x: number
    height: number
    width: number
    layer: 0 | 1 | 2 | 3
    alpha: number
    sway: number
    phase: number
    colorBias: number
    curl: number
    hasWildflower: boolean
  }

  function createGrass(): Blade[] {
    const blades: Blade[] = []
    const total = CONFIG.grassBlades

    // Distribución: 30/25/25/20 (back → front)
    const layerHeights = [0.5, 0.75, 1.0, 1.3]
    const layerAlphas = [0.45, 0.65, 0.85, 1.0]
    const layerWidths = [1.5, 1.2, 1.0, 0.85]

    // El pasto se excluye desde la MITAD de la zona de fade hacia adentro.
    // Resultado: el pasto solo crece en la mitad EXTERIOR del fade (donde
    // la tierra del sendero es casi transparente). En la mitad INTERIOR
    // del fade (tierra ya bastante visible) el pasto se aparta → la
    // transición pasto→tierra→stones se ve más limpia y real.
    const hasPath = pathBounds.left < pathBounds.right
    const halfFade = pathFadeWidth / 2
    const solidLeft  = hasPath ? pathBounds.left  + halfFade : 0
    const solidRight = hasPath ? pathBounds.right - halfFade : 0

    for (let i = 0; i < total; i++) {
      let x = rand(-15, W + 15)

      // Si cae en la zona sólida del sendero, redistribuir al lado más
      // cercano (mantiene total de briznas, concentra en intersection
      // + márgenes externos).
      if (hasPath && x > solidLeft && x < solidRight) {
        if (x < (solidLeft + solidRight) / 2) {
          x = rand(-15, solidLeft)
        } else {
          x = rand(solidRight, W + 15)
        }
      }

      const r = Math.random()
      let layer: 0 | 1 | 2 | 3
      if (r < 0.3) layer = 0
      else if (r < 0.55) layer = 1
      else if (r < 0.8) layer = 2
      else layer = 3

      const baseHeight = 15 + Math.random() * 35
      const isSpike = Math.random() < 0.05
      const height = baseHeight * layerHeights[layer] * (isSpike ? 1.6 : 1)
      const colorBias = Math.random()
      const hasWildflower = layer === 3 && colorBias > 0.96

      blades.push({
        x,
        height,
        width: (1.0 + Math.random() * 1.6) * layerWidths[layer],
        layer,
        alpha: layerAlphas[layer],
        sway: rand(0.5, 1.3),
        phase: rand(0, Math.PI * 2),
        colorBias,
        curl: rand(-0.3, 0.3),
        hasWildflower,
      })
    }
    blades.sort((a, b) => a.layer - b.layer)
    return blades
  }

  function bladeColors(b: Blade) {
    let idx: number
    if (b.colorBias < 0.25) idx = 0
    else if (b.colorBias < 0.6) idx = 1
    else if (b.colorBias < 0.92) idx = 2
    else idx = 3
    return GRASS_VARIANTS[idx]
  }

  let grass = createGrass()

  // drawGrass acepta un rango de capas opcional [min, max]
  //   undefined         → dibuja TODAS (back-compat)
  //   [0, 1]            → solo capas atrás (back grass — antes de stones)
  //   [2, 3]            → solo capas frente (front grass — después de stones)
  // El split permite el overlap visual: back grass detrás de las piedras,
  // front grass enfrente — el sendero se ve "entre" las briznas.
  function drawGrass(t: number, layerRange?: [number, number]) {
    const [minL, maxL] = layerRange ?? [0, 3]
    const windPhase = t * 0.0008

    for (const b of grass) {
      if (b.layer < minL || b.layer > maxL) continue

      const localWave = Math.sin(windPhase + b.x * 0.012 + b.phase) * (2 + b.layer * 1.2)
      const personal = Math.sin(t * 0.0011 * b.sway + b.phase * 2) * 1.2
      const swayX = localWave + personal + b.curl * b.height * 0.15

      const c = bladeColors(b)
      const grad = ctx!.createLinearGradient(b.x, H, b.x + swayX, H - b.height)
      grad.addColorStop(0, c.base)
      grad.addColorStop(0.55, c.mid)
      grad.addColorStop(1, c.tip)

      ctx!.globalAlpha = b.alpha
      ctx!.strokeStyle = grad
      ctx!.lineWidth = b.width
      ctx!.lineCap = "round"
      ctx!.beginPath()
      ctx!.moveTo(b.x, H)
      ctx!.quadraticCurveTo(
        b.x + swayX * 0.3,
        H - b.height * 0.6,
        b.x + swayX,
        H - b.height,
      )
      ctx!.stroke()

      // Wildflower opcional en briznas del frente (~4% de las layer 3)
      if (b.hasWildflower) {
        ctx!.globalAlpha = b.alpha * 0.85
        ctx!.fillStyle = "#f5c2e7"
        ctx!.beginPath()
        ctx!.arc(b.x + swayX, H - b.height, b.width * 0.9, 0, Math.PI * 2)
        ctx!.fill()
      }
    }
    ctx!.globalAlpha = 1
  }

  // -----------------------------------------------------------
  // FIREFLIES — wrap-around suave
  // -----------------------------------------------------------
  type Firefly = {
    x: number
    y: number
    vx: number
    vy: number
    angle: number
    angleSpeed: number
    size: number
    glow: number
    blinkPhase: number
    blinkSpeed: number
    color: string
    targetAlpha: number
    currentAlpha: number
  }

  function createFirefly(spawnFromEdge = false): Firefly {
    let x: number, y: number
    if (spawnFromEdge) {
      const edge = Math.floor(rand(0, 4))
      if (edge === 0) { x = rand(0, W); y = -10 }
      else if (edge === 1) { x = W + 10; y = rand(H * CONFIG.fireflyAreaTop, H) }
      else if (edge === 2) { x = rand(0, W); y = H + 10 }
      else { x = -10; y = rand(H * CONFIG.fireflyAreaTop, H) }
    } else {
      x = rand(0, W)
      y = rand(H * CONFIG.fireflyAreaTop, H - 40)
    }

    return {
      x, y,
      vx: rand(-0.3, 0.3),
      vy: rand(-0.2, 0.2),
      angle: rand(0, Math.PI * 2),
      angleSpeed: rand(0.005, 0.02) * (Math.random() < 0.5 ? -1 : 1),
      size: rand(1.4, 2.08),         // v4: max -20% (era 2.6)
      glow: rand(14, 20.8),          // v4: max -20% (era 26)
      blinkPhase: rand(0, Math.PI * 2),
      blinkSpeed: 0.015 + Math.random() * 0.025,
      color: pick(CONFIG.fireflyColors),
      targetAlpha: spawnFromEdge ? 0 : 1,
      currentAlpha: spawnFromEdge ? 0 : 1,
    }
  }

  let fireflies = Array.from({ length: CONFIG.fireflyCount }, () => createFirefly(false))

  function updateFirefly(f: Firefly, _t: number) {
    f.angle += f.angleSpeed
    f.x += f.vx + Math.sin(f.angle) * 0.45
    f.y += f.vy + Math.cos(f.angle * 0.7) * 0.28

    f.vx += rand(-0.01, 0.01)
    f.vy += rand(-0.008, 0.008)
    f.vx = Math.max(-0.6, Math.min(0.6, f.vx))
    f.vy = Math.max(-0.5, Math.min(0.5, f.vy))

    const margin = 30
    if (f.x < -margin) {
      f.x = W + margin
      f.y = rand(H * CONFIG.fireflyAreaTop, H - 20)
      f.targetAlpha = 0; f.currentAlpha = 0
      setTimeout(() => { f.targetAlpha = 1 }, 200)
    } else if (f.x > W + margin) {
      f.x = -margin
      f.y = rand(H * CONFIG.fireflyAreaTop, H - 20)
      f.targetAlpha = 0; f.currentAlpha = 0
      setTimeout(() => { f.targetAlpha = 1 }, 200)
    } else if (f.y < H * CONFIG.fireflyAreaTop - margin) {
      f.y = H + margin
      f.x = rand(0, W)
      f.targetAlpha = 0; f.currentAlpha = 0
      setTimeout(() => { f.targetAlpha = 1 }, 200)
    } else if (f.y > H + margin) {
      const edge = Math.floor(rand(0, 3))
      if (edge === 0) { f.x = rand(0, W); f.y = H * CONFIG.fireflyAreaTop - 10 }
      else if (edge === 1) { f.x = -margin; f.y = rand(H * CONFIG.fireflyAreaTop, H * 0.8) }
      else { f.x = W + margin; f.y = rand(H * CONFIG.fireflyAreaTop, H * 0.8) }
      f.targetAlpha = 0; f.currentAlpha = 0
      setTimeout(() => { f.targetAlpha = 1 }, 200)
    }

    f.currentAlpha += (f.targetAlpha - f.currentAlpha) * 0.05
    f.blinkPhase += f.blinkSpeed
  }

  function drawFirefly(f: Firefly) {
    if (f.currentAlpha < 0.01) return

    const blink = 0.5 + 0.5 * Math.sin(f.blinkPhase)
    const intensity = (0.35 + 0.65 * blink) * f.currentAlpha
    const { r, g, b } = hexToRgb(f.color)

    const glowR = f.glow * (0.8 + 0.4 * blink)
    const gradient = ctx!.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowR)
    gradient.addColorStop(0, `rgba(${r},${g},${b},${0.85 * intensity})`)
    gradient.addColorStop(0.4, `rgba(${r},${g},${b},${0.25 * intensity})`)
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx!.fillStyle = gradient
    ctx!.beginPath()
    ctx!.arc(f.x, f.y, glowR, 0, Math.PI * 2)
    ctx!.fill()

    ctx!.fillStyle = `rgba(245, 224, 220, ${0.95 * intensity})`
    ctx!.beginPath()
    ctx!.arc(f.x, f.y, f.size, 0, Math.PI * 2)
    ctx!.fill()
  }

  // -----------------------------------------------------------
  // FAIRY DUST — partículas morado/rosa por todo el viewport
  // -----------------------------------------------------------
  type Dust = {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    alpha: number
    alphaTarget: number
    alphaSpeed: number
    life: number
    maxLife: number
  }

  function createDust(): Dust {
    return {
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.25, -0.05),
      size: rand(0.6, 1.8),
      color: pick(CONFIG.fairyDustColors),
      alpha: 0,
      alphaTarget: rand(0.1, CONFIG.fairyDustMaxOpacity),
      alphaSpeed: rand(0.003, 0.012),
      life: 0,
      maxLife: rand(300, 900),
    }
  }

  let dust = Array.from({ length: CONFIG.fairyDustCount }, () => createDust())

  function updateDust(d: Dust) {
    d.x += d.vx
    d.y += d.vy
    d.vx += rand(-0.008, 0.008)
    d.vx = Math.max(-0.3, Math.min(0.3, d.vx))
    d.life++

    const phase = d.life / d.maxLife
    if (phase < 0.2) {
      d.alphaTarget = rand(0.15, CONFIG.fairyDustMaxOpacity)
    } else if (phase > 0.8) {
      d.alphaTarget = 0
    }
    d.alpha += (d.alphaTarget - d.alpha) * d.alphaSpeed * 5

    if (
      d.life > d.maxLife ||
      d.y < -10 || d.y > H + 10 ||
      d.x < -10 || d.x > W + 10
    ) {
      Object.assign(d, createDust())
      if (Math.random() < 0.4) {
        d.y = H + rand(5, 30)
        d.x = rand(0, W)
      }
    }
  }

  function drawDust(d: Dust) {
    if (d.alpha < 0.01) return
    const { r, g, b } = hexToRgb(d.color)
    const haloR = d.size * 6
    const grad = ctx!.createRadialGradient(d.x, d.y, 0, d.x, d.y, haloR)
    grad.addColorStop(0, `rgba(${r},${g},${b},${d.alpha * 0.55})`)
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${d.alpha * 0.15})`)
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx!.fillStyle = grad
    ctx!.beginPath()
    ctx!.arc(d.x, d.y, haloR, 0, Math.PI * 2)
    ctx!.fill()

    ctx!.fillStyle = `rgba(${r},${g},${b},${d.alpha})`
    ctx!.beginPath()
    ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2)
    ctx!.fill()
  }

  // -----------------------------------------------------------
  // LOOP principal
  // -----------------------------------------------------------
  let rafId = 0
  let isVisible = true

  function loop(t: number) {
    if (!isVisible) {
      rafId = requestAnimationFrame(loop)
      return
    }

    ctx!.clearRect(0, 0, W, H)

    // -----------------------------------------------------------
    //  Orden de capas (back → front):
    //   1. Fairy dust         — fondo, partículas
    //   2. Path gradient      — strip earth-tone (con fade en bordes)
    //   3. Grass BACK (0-1)   — briznas cortas DETRÁS de piedras
    //   4. Stones             — piedras del sendero
    //   5. Grass FRONT (2-3)  — briznas altas DELANTE de piedras → overlap
    //   6. Fireflies          — frente, luciérnagas
    // -----------------------------------------------------------
    for (const d of dust) {
      updateDust(d)
      drawDust(d)
    }

    drawPath()
    drawGrass(t, [0, 1])
    drawStones()
    drawGrass(t, [2, 3])

    for (const f of fireflies) {
      updateFirefly(f, t)
      drawFirefly(f)
    }

    rafId = requestAnimationFrame(loop)
  }

  resize()

  const onVisibility = () => { isVisible = !document.hidden }
  document.addEventListener("visibilitychange", onVisibility)

  const onThemeChange = (e: Event) => {
    const detail = (e as CustomEvent).detail
    if (detail?.theme === "light") {
      cancelAnimationFrame(rafId)
    } else {
      rafId = requestAnimationFrame(loop)
    }
  }
  document.addEventListener("themechange", onThemeChange as EventListener)

  rafId = requestAnimationFrame(loop)

  // Cleanup en SPA navigation
  window.addCleanup?.(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener("resize", onResize)
    document.removeEventListener("visibilitychange", onVisibility)
    document.removeEventListener("themechange", onThemeChange as EventListener)
  })
})
