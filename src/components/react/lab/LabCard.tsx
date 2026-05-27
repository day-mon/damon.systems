interface LabCardProps {
  title: string;
  description: string;
  date: string;
  tags: string[];
  href: string;
  hasDemo?: boolean;
}

export default function LabCard({ title, description, date, tags, href, hasDemo }: LabCardProps) {
  return (
    <a href={href} className="block p-6 border border-border hover:bg-accent/50 transition-colors group">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h2 className="text-lg font-medium">{title}</h2>
        <time className="text-xs text-muted-foreground font-mono shrink-0">{date}</time>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground/60">
              {tag}
            </span>
          ))}
        </div>
      )}
      {hasDemo && (
        <span className="inline-block text-xs border border-border px-2 py-1 text-muted-foreground group-hover:text-foreground transition-colors">
          view demo
        </span>
      )}
    </a>
  );
}
