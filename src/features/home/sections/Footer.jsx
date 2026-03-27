import { footerColumns } from '../data/content'

function Footer() {
  return (
    <footer className="mt-16 grid gap-8 border-t border-slate-200 pt-10 text-sm text-slate-600 md:grid-cols-5">
      <div className="md:col-span-2">
        <p className="text-base font-semibold text-slate-900">InfiLearn</p>
        <p className="mt-2 max-w-sm text-xs leading-6">
          Cultivating the next generation of creative and technical mastery through editorial learning experiences.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          © 2024 InfiLearn Cognitive Atelier. All rights reserved.
        </p>
      </div>

      {footerColumns.map((column) => (
        <div key={column.heading}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {column.heading}
          </h3>
          <ul className="mt-3 space-y-2 text-xs">
            {column.links.map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        </div>
      ))}
    </footer>
  )
}

export default Footer
