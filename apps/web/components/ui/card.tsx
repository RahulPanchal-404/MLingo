type CardProps = { title: string; description: string };

export function Card({ title, description }: CardProps) {
  return <article className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>;
}
