import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, HandHeart, Search } from 'lucide-react';
import { ORGANIZATIONS } from '../../data/organizations';
import { ORGANIZATION_FILTERS } from '../../data/organizationFilters';

interface OrganizationListProps {
  query: string;
  filter: number;
}

const PAGE_SIZE = 10;

export function OrganizationList({ query, filter }: OrganizationListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => setVisibleCount(PAGE_SIZE), [filter, query]);
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const matching = useMemo(() => ORGANIZATIONS.filter(organization =>
    (ORGANIZATION_FILTERS[filter].ids === null || (ORGANIZATION_FILTERS[filter].ids as readonly number[]).includes(organization.id)) &&
    `${organization.name} ${organization.category} ${organization.description}`
      .toLocaleLowerCase('pt-BR').includes(normalizedQuery)
  ), [normalizedQuery, filter]);

  const visible = matching.slice(0, visibleCount);

  return (
    <section aria-label="Organizações escolhidas pelo Soul" className="space-y-4 pb-8">
      <div className="px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-textSecondary">Fazer o Bem</h2>
        <p className="mt-1 text-xs leading-relaxed text-textSecondary/70">
          Conheça organizações escolhidas pela equipe Soul. O botão abre o site oficial de cada uma.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-6 text-center text-sm text-textSecondary">
          <Search className="mx-auto mb-2 h-5 w-5" aria-hidden="true" />
          Nenhuma organização encontrada para esta busca.
        </div>
      ) : visible.map(organization => (
        <article key={organization.id} className="soul-glass rounded-2xl border border-white/[0.08] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
              <HandHeart className="h-5 w-5 text-white/80" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-textSecondary">{organization.category}</p>
              <h3 className="mt-1 text-base font-semibold text-white">{organization.name}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">{organization.description}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
            <span className="min-w-0 truncate text-xs text-textSecondary">{new URL(organization.website).hostname}</span>
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ajudar ${organization.name} no site oficial`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ajudar ONG <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </article>
      ))}

      {visibleCount < matching.length && (
        <button type="button" onClick={() => setVisibleCount(count => count + PAGE_SIZE)} className="mx-auto block rounded-xl border border-white/10 px-5 py-2.5 text-sm text-textSecondary hover:bg-white/[0.05] hover:text-white">
          Ver mais organizações
        </button>
      )}
    </section>
  );
}
