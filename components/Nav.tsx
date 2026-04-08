// components/Nav.tsx
// Server component. Renders the site nav bar.
// Bold 2px bottom border separates nav from content.

export default function Nav() {
  const siteName = process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'BeatHQ';

  return (
    <nav className="flex justify-between items-center px-16 py-[22px] border-b-2 border-ink">
      <span className="text-xs font-bold tracking-[4px] uppercase text-ink">
        {siteName}
      </span>
      <ul className="flex gap-10 list-none m-0 p-0">
        <li className="text-[10px] tracking-[2.5px] uppercase text-muted hover:text-ink transition-colors duration-150 cursor-pointer">
          Beats
        </li>
        <li className="text-[10px] tracking-[2.5px] uppercase text-muted hover:text-ink transition-colors duration-150 cursor-pointer">
          Contact
        </li>
      </ul>
    </nav>
  );
}
