import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// @ts-ignore
import script from "./scripts/fireflies.inline"
import style from "./styles/fireflies.scss"

/**
 * Fireflies — escena nocturna animada
 *
 * Renderiza un canvas full-viewport con:
 *   · pasto en 4 capas con sway de viento
 *   · luciérnagas con wrap-around suave
 *   · fairy dust morado/rosa esporádico
 *
 * Lógica en quartz/components/scripts/fireflies.inline.ts
 * Estilos  en quartz/components/styles/fireflies.scss
 *
 * Se desactiva automáticamente en:
 *   · light mode
 *   · prefers-reduced-motion
 */
const Fireflies: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <div class="fireflies-container" aria-hidden="true">
      <canvas class="fireflies-canvas"></canvas>
    </div>
  )
}

Fireflies.afterDOMLoaded = script
Fireflies.css = style

export default (() => Fireflies) satisfies QuartzComponentConstructor
