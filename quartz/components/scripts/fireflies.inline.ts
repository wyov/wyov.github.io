// =============================================================
//  fireflies.inline.ts — wyov-blog (v3)
// =============================================================
//  Escena nocturna animada con tres capas:
//
//    1) Fairy dust  — partículas morado/rosa dispersas por TODO
//                     el viewport, lentas, baja opacidad.
//    2) Grass       — 4 CAPAS de pasto en la franja inferior,
//                     con variación de tonos por brizna,
//                     sway de viento que viaja como onda, y
//                     un sutil tono de tierra al fondo.
//    3) Fireflies   — luciérnagas con wrap-around suave.
// =============================================================

const CONFIG = {
  // ----- fireflies -----
  fireflyCount: window.innerWidth < 600 ? 10 : 18,
  fireflyColors: ["#f9e2af", "#fab387", "#f5e0dc"],
  fireflyAreaTop: 0.30,

  // ----- Pasto -----
  grassBlades: window.innerWidth < 600 ? 180 : 320,

  // ----- Fairy dust -----
  fairyDustCount: window.innerWidth < 600 ? 35 : 70,
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
    grass = createGrass()  // re-generar briznas cuando cambia el ancho
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
  // GRASS — 4 capas + Viento
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

    for (let i = 0; i < total; i++) {
      const r = Math.random()
      let layer: 0 | 1 | 2 | 3
      if (r < 0.3) layer = 0
      else if (r < 0.55) layer = 1
      else if (r < 0.8) layer = 2
      else layer = 3

      const baseHeight = 30 + Math.random() * 70
      const isSpike = Math.random() < 0.02         // % spikes
      const height = baseHeight * layerHeights[layer] * (isSpike ? 1.6 : 1)
      const colorBias = Math.random()
      const hasWildflower = layer === 3 && colorBias > 0.96

      blades.push({
        x: rand(-15, W + 15),
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
    // Ordenar por capa → se dibujan back → front
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

  function drawGrass(t: number) {
    // Tierra: gradiente sutil al fondo
    const soilGrad = ctx!.createLinearGradient(0, H - 8, 0, H)
    soilGrad.addColorStop(0, "rgba(20, 12, 6, 0)")
    soilGrad.addColorStop(1, "rgba(28, 18, 10, 0.7)")
    ctx!.fillStyle = soilGrad
    ctx!.fillRect(0, H - 8, W, 8)

    // Viento: wave left to right
    const windPhase = t * 0.0008

    for (const b of grass) {
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

      // Wildflower opcional (~4% layer 3)
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
  // FIREFLIES — wrap-around soft
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
      size: rand(1.4, 2.6),
      glow: rand(14, 26),
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
  // FAIRY DUST — viewport
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

    // Orden: dust (fondo) → grass → fireflies (frente)
    for (const d of dust) {
      updateDust(d)
      drawDust(d)
    }

    drawGrass(t)

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
