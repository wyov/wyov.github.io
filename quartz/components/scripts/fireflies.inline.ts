// =================================================================
// Fireflies — script de animación (Canvas 2D)
//
// Renderiza:
//   - Pasto en la parte inferior (varias briznas, sway sutil)
//   - Luciérnagas flotando con movimiento orgánico y blink
//   - Glow radial alrededor de cada luciérnaga
//
// Paleta: Catppuccin Mocha
//   - Pasto base:     #1a3a1a (verde oscuro)
//   - Pasto tip:      #a6e3a1 (green)
//   - Luciérnaga:     #f9e2af (yellow) + #fab387 (peach) variantes
//
// Performance:
//   - Pausa cuando la pestaña no está visible
//   - Respeta prefers-reduced-motion
//   - Cantidad de partículas reducida en pantallas pequeñas
// =================================================================

document.addEventListener("nav", () => {
  const canvas = document.querySelector(
    ".fireflies-canvas"
  ) as HTMLCanvasElement | null

  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Respetar preferencia de usuario
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
  if (prefersReducedMotion) return

  // -----------------------------------------------------------------
  // Configuración
  // -----------------------------------------------------------------
  const CONFIG = {
    fireflyCount: window.innerWidth < 600 ? 8 : 14,
    grassBlades: window.innerWidth < 600 ? 50 : 90,
    fireflyColors: ["#f9e2af", "#fab387", "#f5e0dc"], // yellow, peach, rosewater
    grassBaseColor: "#0a1a0a",
    grassTipColor: "#a6e3a1",
    grassMidColor: "#3b6d11",
  }

  // -----------------------------------------------------------------
  // Resize handler — canvas se ajusta al container
  // -----------------------------------------------------------------
  function resize() {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + "px"
    canvas.style.height = rect.height + "px"
  }

  resize()
  window.addEventListener("resize", resize)

  // -----------------------------------------------------------------
  // Crear luciérnagas
  // -----------------------------------------------------------------
  type Firefly = {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    blinkPhase: number
    blinkSpeed: number
    angle: number
    color: string
    showWings: boolean
  }

  const fireflies: Firefly[] = Array.from({ length: CONFIG.fireflyCount }, () => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.random() * rect.width,
      y: Math.random() * rect.height * 0.75 + rect.height * 0.05,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.3 + 0.9,
      blinkPhase: Math.random() * Math.PI * 2,
      blinkSpeed: 0.015 + Math.random() * 0.025,
      angle: Math.random() * Math.PI * 2,
      color:
        CONFIG.fireflyColors[
          Math.floor(Math.random() * CONFIG.fireflyColors.length)
        ],
      showWings: Math.random() > 0.4,
    }
  })

  // -----------------------------------------------------------------
  // Crear pasto (precomputado, solo el sway se anima)
  // -----------------------------------------------------------------
  type GrassBlade = {
    x: number
    height: number
    swayAmount: number
    swayOffset: number
    width: number
  }

  const grass: GrassBlade[] = Array.from({ length: CONFIG.grassBlades }, () => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.random() * rect.width,
      height: 12 + Math.random() * 30,
      swayAmount: 0.5 + Math.random() * 1.5,
      swayOffset: Math.random() * Math.PI * 2,
      width: 0.8 + Math.random() * 1.2,
    }
  })

  // -----------------------------------------------------------------
  // Helper: convertir hex a rgba
  // -----------------------------------------------------------------
  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // -----------------------------------------------------------------
  // Dibujar pasto
  // -----------------------------------------------------------------
  function drawGrass(time: number) {
    const rect = canvas.getBoundingClientRect()
    const baseY = rect.height

    grass.forEach((blade) => {
      const sway =
        Math.sin(time * 0.0008 + blade.swayOffset + blade.x * 0.01) *
        blade.swayAmount

      const gradient = ctx!.createLinearGradient(
        blade.x,
        baseY,
        blade.x + sway,
        baseY - blade.height
      )
      gradient.addColorStop(0, CONFIG.grassBaseColor)
      gradient.addColorStop(0.5, CONFIG.grassMidColor)
      gradient.addColorStop(1, hexToRgba(CONFIG.grassTipColor, 0.45))

      ctx!.strokeStyle = gradient
      ctx!.lineWidth = blade.width
      ctx!.lineCap = "round"

      ctx!.beginPath()
      ctx!.moveTo(blade.x, baseY)
      ctx!.quadraticCurveTo(
        blade.x + sway * 0.5,
        baseY - blade.height * 0.5,
        blade.x + sway,
        baseY - blade.height
      )
      ctx!.stroke()
    })
  }

  // -----------------------------------------------------------------
  // Dibujar una luciérnaga
  // -----------------------------------------------------------------
  function drawFirefly(f: Firefly) {
    const opacity = ((Math.sin(f.blinkPhase) + 1) / 2) * 0.75 + 0.25

    // Glow exterior radial
    const glowSize = f.radius * 9
    const glowGrad = ctx!.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowSize)
    glowGrad.addColorStop(0, hexToRgba(f.color, opacity * 0.55))
    glowGrad.addColorStop(0.3, hexToRgba(f.color, opacity * 0.2))
    glowGrad.addColorStop(1, hexToRgba(f.color, 0))

    ctx!.fillStyle = glowGrad
    ctx!.beginPath()
    ctx!.arc(f.x, f.y, glowSize, 0, Math.PI * 2)
    ctx!.fill()

    // Alas (si las tiene esta luciérnaga, pintadas en su variante de color)
    if (f.showWings) {
      ctx!.strokeStyle = hexToRgba(f.color, opacity * 0.35)
      ctx!.lineWidth = 0.5

      // Ala izquierda
      ctx!.beginPath()
      ctx!.ellipse(
        f.x - f.radius * 1.2,
        f.y - 0.5,
        f.radius * 1.6,
        f.radius * 0.7,
        -0.35,
        0,
        Math.PI * 2
      )
      ctx!.stroke()

      // Ala derecha
      ctx!.beginPath()
      ctx!.ellipse(
        f.x + f.radius * 1.2,
        f.y - 0.5,
        f.radius * 1.6,
        f.radius * 0.7,
        0.35,
        0,
        Math.PI * 2
      )
      ctx!.stroke()
    }

    // Cuerpo (la bolita brillante en el centro)
    ctx!.fillStyle = hexToRgba("#fff4c8", opacity)
    ctx!.beginPath()
    ctx!.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
    ctx!.fill()
  }

  // -----------------------------------------------------------------
  // Loop principal
  // -----------------------------------------------------------------
  let lastTime = performance.now()
  let animationId: number | null = null
  let isVisible = true

  function animate(currentTime: number) {
    if (!isVisible) {
      animationId = requestAnimationFrame(animate)
      return
    }

    const rect = canvas.getBoundingClientRect()

    // Limpiar canvas
    ctx!.clearRect(0, 0, rect.width, rect.height)

    // Dibujar pasto primero (al fondo)
    drawGrass(currentTime)

    // Actualizar y dibujar luciérnagas
    fireflies.forEach((f) => {
      // Movimiento orgánico: velocidad base + curva sinusoidal
      f.angle += 0.012
      f.x += f.vx + Math.sin(f.angle) * 0.35
      f.y += f.vy + Math.cos(f.angle * 0.7) * 0.22

      // Wrap around edges
      if (f.x < -15) f.x = rect.width + 15
      if (f.x > rect.width + 15) f.x = -15
      if (f.y < 0) f.y = rect.height * 0.85
      if (f.y > rect.height - 30) f.y = rect.height * 0.1

      // Blink
      f.blinkPhase += f.blinkSpeed

      drawFirefly(f)
    })

    animationId = requestAnimationFrame(animate)
  }

  // -----------------------------------------------------------------
  // Pause cuando la pestaña no está visible (ahorra batería)
  // -----------------------------------------------------------------
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden
  })

  // -----------------------------------------------------------------
  // Cleanup en navegación SPA de Quartz
  // -----------------------------------------------------------------
  window.addCleanup?.(() => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
    window.removeEventListener("resize", resize)
  })

  // Iniciar
  animationId = requestAnimationFrame(animate)
})
