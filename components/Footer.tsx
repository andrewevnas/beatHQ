// components/Footer.tsx
// Server component. Renders the site footer.
// Bold 2px top border separates footer from content.

export default function Footer() {
  const siteName = process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'BeatHQ';
  const year = new Date().getFullYear();

  return (
    <footer className="flex justify-between items-center px-16 py-[18px] border-t-2 border-ink">
      <span className="text-[9px] tracking-[2px] uppercase text-muted">
        All Rights Reserved
      </span>
      <span className="text-[9px] tracking-[2px] uppercase text-muted">
        © {year} {siteName}
      </span>
    </footer>
  );
}
