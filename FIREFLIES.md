# Fireflies — escena nocturna animada

```
##############################################################
#                                                            #
#   Pasto + luciérnagas en la parte inferior del viewport    #
#   Canvas fixed, no afecta clicks ni selección de texto     #
#                                                            #
##############################################################
```

## Archivos involucrados

Esta animación está distribuida en **3 archivos** dentro de
`quartz/components/`:

```
quartz/components/
├── Fireflies.tsx                       <-- componente principal
├── styles/
│   └── fireflies.scss                  <-- estilos (posición, z-index)
└── scripts/
    └── fireflies.inline.ts             <-- lógica de animación (Canvas 2D)
```

Y se activa desde:

```
quartz.layout.ts                        <-- import + uso en afterBody
```

### Qué hace cada archivo

| Archivo | Responsabilidad |
|---|---|
| `Fireflies.tsx` | Define el componente Quartz. Renderiza un `<div>` con un `<canvas>` adentro y conecta los estilos y el script. **El archivo más corto, el "pegamento".** |
| `fireflies.scss` | Define dónde se posiciona el canvas (fixed bottom, 220px de alto), z-index, pointer-events, y comportamiento en light mode (oculto). |
| `fireflies.inline.ts` | **La animación en sí.** Aquí están las luciérnagas, el pasto, las paletas de color, las funciones de dibujo y el loop de `requestAnimationFrame`. Si querés tocar cualquier cosa de cómo se ve, vení aquí. |

## Cómo customizar

### Cambiar la cantidad de luciérnagas

En `fireflies.inline.ts`, buscar:

```typescript
const CONFIG = {
  fireflyCount: window.innerWidth < 600 ? 8 : 14,   // <-- cambiar acá
  grassBlades:  window.innerWidth < 600 ? 50 : 90,
  ...
}
```

Subilo a 20 si querés más densidad, bajalo a 6 si querés más calma.

### Cambiar los colores de las luciérnagas

En el mismo `CONFIG`:

```typescript
fireflyColors: ["#f9e2af", "#fab387", "#f5e0dc"],   // yellow, peach, rosewater
```

Cada luciérnaga elige uno random de este array al crearse. Si querés
todas del mismo color, deja solo uno. Otras opciones Catppuccin Mocha:

```typescript
// Variantes posibles
["#cba6f7"]                       // mauve únicamente
["#94e2d5", "#89dceb"]            // teal + sky (ambiente acuático)
["#a6e3a1", "#94e2d5"]            // green + teal (bosque)
["#f5c2e7", "#cba6f7", "#b4befe"] // pink + mauve + lavender (mística)
```

### Cambiar la altura de la escena

En `fireflies.scss`:

```scss
.fireflies-container {
  ...
  height: 220px;        // <-- subilo a 320px o bajalo a 150px
  ...
}
```

220px es lo recomendado — suficiente para ver el pasto y dejar
espacio a las luciérnagas. Si lo subes mucho, va a competir
visualmente con el contenido del post.

### Cambiar el color del pasto

En `fireflies.inline.ts`, dentro de `CONFIG`:

```typescript
grassBaseColor: "#0a1a0a",          // raíz, casi negro
grassMidColor:  "#3b6d11",          // medio
grassTipColor:  "#a6e3a1",          // punta, verde Catppuccin
```

El gradiente va de la raíz a la punta. Si querés pasto otoñal:

```typescript
grassBaseColor: "#1a0a0a",
grassMidColor:  "#854f0b",          // peach oscuro
grassTipColor:  "#fab387",          // peach
```

### Cambiar la velocidad de las luciérnagas

Buscá en `fireflies.inline.ts`:

```typescript
f.x += f.vx + Math.sin(f.angle) * 0.35   // <-- factor 0.35
f.y += f.vy + Math.cos(f.angle * 0.7) * 0.22
```

Subir esos números = movimiento más rápido. Bajarlos = más lento y
contemplativo.

### Cambiar la frecuencia de blink

```typescript
blinkSpeed: 0.015 + Math.random() * 0.025,
```

Subilo para parpadeo más rápido, bajalo para luciérnagas más serenas.

### Desactivar la animación temporalmente

En `quartz.layout.ts`, comentá la línea:

```typescript
afterBody: [
  // Fireflies(),    // <-- comentado
],
```

Y rebuilds del sitio no la van a incluir.

## Cómo funciona técnicamente

```
                    [ DOM Mounted ]
                          |
                          v
              fireflies.inline.ts ejecuta
                          |
              busca .fireflies-canvas
                          |
        +-----------------+-----------------+
        v                                   v
  resize() ajusta                  Crea N luciérnagas
  canvas a containers               (posición, velocidad,
                                    fase de blink, color)
        |                                   |
        +-----------------+-----------------+
                          v
              requestAnimationFrame loop
                          |
              +-----------+-----------+
              v                       v
       drawGrass()              forEach firefly:
       (briznas con              actualizar pos
        sway sutil)              actualizar blink
                                 drawFirefly()
                                  - glow radial
                                  - alas (si tiene)
                                  - cuerpo (cream)
```

## Compatibilidad

- **Funciona en:** todos los navegadores modernos (Chrome, Firefox,
  Safari, Edge) con soporte de Canvas 2D.
- **Mobile-friendly:** detecta pantallas pequeñas y reduce cantidad
  de partículas automáticamente.
- **Accesibilidad:** respeta `prefers-reduced-motion` y desactiva
  la animación para usuarios que la hayan pedido. También tiene
  `aria-hidden="true"` y `pointer-events: none`.
- **Light mode:** la escena se oculta automáticamente. Es nocturna,
  no encaja con un theme claro.
- **Performance:** pausa el loop cuando la pestaña no está visible
  (Page Visibility API), ahorra batería. ~60fps en hardware decente.

## Si algo se ve mal

### Las luciérnagas están sobre el texto

Significa que el `z-index` del contenido no está por encima del
canvas. En `fireflies.scss` revisá la regla:

```scss
body > #quartz-root,
body > main,
body > footer {
  position: relative;
  z-index: 1;
}
```

Si tu sitio usa otro wrapper que no sea `#quartz-root`, `main`, o
`footer`, agregá el selector ahí.

### El canvas no aparece

1. Verificá que el componente esté importado en `quartz.layout.ts`
2. Verificá que esté agregado en `afterBody`
3. Verificá que estés en dark mode (en light se oculta a propósito)
4. Abrí DevTools → Console y buscá errores

### Demasiado movimiento, se siente caótico

Bajá `fireflyCount` a 6-8 y bajá el factor de velocidad a 0.2.

---

```
##############################################################
#                                                            #
#  Las luciérnagas existen para acompañar, no para           #
#  competir con el contenido. Si en algún momento se         #
#  vuelven distracción, bajá la densidad o desactivalo.      #
#                                                            #
##############################################################
```
