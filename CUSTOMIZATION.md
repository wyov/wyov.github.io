# wyov-blog — guía de customización

```
##############################################################
#  Cosas que vas a querer cambiar a lo largo del tiempo      #
##############################################################
```

## 1. Cambiar el acento mauve a otro color

El acento principal del sitio está en `quartz.config.ts` bajo
`darkMode.secondary`. Por default es **mauve** (`#cba6f7`). Si querés
cambiarlo, abrí `quartz.config.ts` y cambiá esa línea:

```typescript
darkMode: {
  ...
  secondary: "#f5c2e7",   // pink en vez de mauve
  tertiary: "#f5e0dc",    // rosewater como hover
  ...
}
```

Paleta Catppuccin Mocha completa para que elijas:

```
mauve     #cba6f7   morado-lavanda     <-- default
pink      #f5c2e7   rosa pastel
lavender  #b4befe   lavanda más fría
sky       #89dceb   azul cielo
teal      #94e2d5   verde-azulado
green     #a6e3a1   verde menta
peach     #fab387   durazno cálido
yellow    #f9e2af   amarillo crema
red       #f38ba8   rojo pastel
maroon    #eba0ac   maroon suave
```

Después de cambiarlo, también ajustá `quartz/styles/custom.scss` si
querés que los wikilinks, callouts y tags usen el nuevo acento — busca
las referencias a `--ctp-mauve` y reemplazá con el color elegido.

## 2. Salir de OLED puro y volver a Mocha clásico

Si decidís que el negro absoluto es demasiado, cambiá en `quartz.config.ts`:

```typescript
darkMode: {
  light: "#1e1e2e",       // base Mocha original
  ...
}
```

Y en `quartz/styles/custom.scss`:

```scss
:root {
  ...
  --ctp-base:   #1e1e2e;
  --ctp-mantle: #181825;
  --ctp-crust:  #11111b;
}
```

## 3. Cambiar la tipografía

Por default usamos JetBrains Mono everywhere (vibe terminal/neovim).
Para algo más legible en body manteniendo mono en code:

```typescript
typography: {
  header: "Inter",              // o "Schibsted Grotesk"
  body:   "IBM Plex Sans",      // o "Inter"
  code:   "JetBrains Mono",     // <-- code siempre mono
}
```

Cualquier fuente de Google Fonts funciona.

## 4. Configurar dominio propio

Cuando compres dominio (Namecheap, Cloudflare, etc):

**4.1.** En tu repo, crea el archivo `content/CNAME` con una sola línea:
```
wyov.dev
```

**4.2.** En `quartz.config.ts` actualizá `baseUrl`:
```typescript
baseUrl: "wyov.dev",
```

**4.3.** En el panel DNS de tu registrar, apuntá:

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | wyov.github.io         |

**4.4.** En tu repo de GitHub: Settings → Pages → Custom domain →
escribí `wyov.dev` → activar Enforce HTTPS.

## 5. Agregar comments con giscus

Giscus usa GitHub Discussions como sistema de comments. Es gratis,
sin tracking, y matchea el theme dark.

**5.1.** Activá Discussions en tu repo: Settings → Features → Discussions.

**5.2.** Instalá la GitHub App de giscus: https://github.com/apps/giscus
Habilitalo solo en `wyov-blog`.

**5.3.** Configurá en giscus.app, copiá los IDs.

**5.4.** En `quartz.layout.ts`, agregá Comments al final de `afterBody`:

```typescript
afterBody: [
  Component.Comments({
    provider: "giscus",
    options: {
      repo: "wyov/wyov-blog",
      repoId: "R_kgDxxx",         // <-- el que copiaste de giscus.app
      category: "Announcements",
      categoryId: "DIC_kwxxx",    // <-- el que copiaste
      mapping: "url",
      strict: false,
      reactionsEnabled: true,
      inputPosition: "bottom",
      theme: "catppuccin_mocha",
    },
  }),
],
```

## 6. Agregar analytics privacy-friendly

Plausible (de pago, pero respeta privacy) o Umami (self-hosted gratis).

Para Plausible, en `quartz.config.ts`:

```typescript
analytics: {
  provider: "plausible",
  host: "plausible.io",  // o tu instancia self-hosted
},
```

Para no usar analytics:

```typescript
analytics: null,
```

## 7. Marcar posts como draft

En el frontmatter de cualquier .md:

```yaml
---
title: "Post en progreso"
draft: true
---
```

El plugin `RemoveDrafts` (ya activado en `quartz.config.ts`) los
ocultará del build. Cuando esté listo, cambia a `draft: false`.

## 8. Migrar tus cheatsheets existentes

Recomendación de estructura:

```
content/
├── cheatsheets/
│   ├── adcs-enum.md
│   ├── ad-enumeration-pt1.md
│   ├── ad-enumeration-pt2.md
│   ├── ad-enumeration-pt3.md
│   ├── aws-iam-attacks.md
│   ├── jwt-attacks.md
│   └── windows-kernel-byovd.md
├── posts/
│   └── ...
└── writeups/
    └── ...
```

Los cheatsheets que ya tenés (ADCS, AD enum partes 1-3, etc.) se pegan
ahí casi sin tocar. Solo asegurate de agregar el frontmatter mínimo:

```yaml
---
title: "Active Directory enumeration — parte 1"
date: 2026-04-15
tags:
  - active-directory
  - enumeration
  - red-team
draft: false
---
```

## 9. Wikilinks entre cheatsheets

Quartz soporta wikilinks estilo Obsidian. Para enlazar de un cheatsheet
a otro:

```markdown
Ver también [[cheatsheets/adcs-enum]] para ADCS específicamente.

O con label custom: [[cheatsheets/adcs-enum|el cheatsheet de ADCS]].
```

Esto genera backlinks automáticos en el panel derecho del sitio.

## 10. Ignorar archivos privados

En `quartz.config.ts`:

```typescript
ignorePatterns: [
  "private",       // carpeta content/private/ entera
  "templates",     // tu carpeta de plantillas Obsidian
  ".obsidian",     // config de Obsidian
  "**/*.private.md",  // archivos terminados en .private.md
],
```

## 11. Solo publicar lo marcado con `publish: true`

Si querés mantener tu vault entero pero solo publicar lo explícito,
ya tenés activado `ExplicitPublish()` en `quartz.config.ts`. Marca
los posts que SÍ querés publicar con:

```yaml
---
title: "Mi post"
publish: true
---
```

Si NO querés esta validación (querés que TODO se publique por
default), quitá `Plugin.ExplicitPublish()` del array de `filters`
en `quartz.config.ts`.

---

```
##############################################################
#                                                            #
#  La estructura es un andamio, no una jaula.                #
#  Cambiá lo que no te sirva. El sitio es tuyo.              #
#                                                            #
##############################################################
```
