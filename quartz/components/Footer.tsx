import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? {}
    const linkEntries = Object.entries(links)

    return (
      <footer class={`footer-clean ${displayClass ?? ""}`}>
        <span class="footer-copy">© {year} wyov</span>
        {linkEntries.map(([text, link]) => (
          <>
            <span class="footer-sep">·</span>
            
              href={link}
              class="footer-link"
              rel="noopener noreferrer"
            >
              {text}
            </a>
          </>
        ))}
      </footer>
    )
  }

  Footer.css = `
.footer-clean {
  padding: 2rem 0 3rem;
  margin-top: 4rem;
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: var(--gray);
  border-top: 1px solid var(--lightgray);
  position: relative;
  z-index: 2;
  background: var(--light);
}

.footer-copy {
  color: var(--gray);
}

.footer-link {
  color: var(--gray);
  text-decoration: none;
  margin: 0 0.4rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--secondary);
}

.footer-sep {
  opacity: 0.4;
  display: inline-block;
  margin: 0 0.2rem;
}
`

  return Footer
}) satisfies QuartzComponentConstructor
