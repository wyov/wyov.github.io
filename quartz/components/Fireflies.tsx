// =================================================================
// Fireflies — escena nocturna animada para el footer
// Render: canvas fijo en la parte inferior del viewport
// =================================================================

// @ts-ignore
import script from "./scripts/fireflies.inline"
// @ts-ignore
import style from "./styles/fireflies.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Fireflies: QuartzComponent = () => {
  return (
    <div class="fireflies-container" aria-hidden="true">
      <canvas class="fireflies-canvas"></canvas>
    </div>
  )
}

Fireflies.css = style
Fireflies.afterDOMLoaded = script

export default (() => Fireflies) satisfies QuartzComponentConstructor
