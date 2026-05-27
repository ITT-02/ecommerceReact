import TimelineCard from './TimelineCard';
import { timelineData } from './timelineData';

export default function TimelineSection({
  title = 'CRONOLOGÍA',
  subtitle = 'NUESTRO CAMINO',
  items = timelineData,
}) {
  return (
    <section className="relative w-full bg-[#f5f2ed]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Encabezado */}
        <div className="mb-10 sm:mb-14 text-center">
          <div className="text-xs sm:text-sm tracking-[0.28em] font-medium text-amber-700 uppercase">
            {subtitle}
          </div>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl tracking-wide text-gray-900">
            {title}
          </h2>
        </div>

        {/* Línea central */}
        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 bg-black/10" />

          <div className="space-y-10 sm:space-y-12">
            {items.map((item, idx) => (
              <TimelineCard
                key={`${item.year}-${idx}`}
                year={item.year}
                title={item.title}
                description={item.description}
                align={idx % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


