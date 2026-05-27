export default function TimelineCard({
  year,
  title,
  description,
  align = 'left',
}) {
  const isLeft = align === 'left';

  return (
    <div className="relative w-full">
      {/*
        Desktop/tablet: alternamos.
        Móvil: siempre centrado y en una sola columna.
      */}
      <div className={isLeft ? 'md:pr-[52%]' : 'md:pl-[52%]'}>
        <div
          className="group relative mx-auto rounded-xl bg-white shadow-[0_10px_30px_rgba(17,24,39,0.08)] border border-black/5 transition-transform duration-300 ease-out hover:-translate-y-1 hover:hover:shadow-[0_18px_45px_rgba(17,24,39,0.12)]"
          role="article"
        >
          {/* Punto circular alineado con la línea central */}
          <div
            className={
              isLeft
                ? 'hidden md:block absolute -right-[27px] top-8'
                : 'hidden md:block absolute -left-[27px] top-8'
            }
          >
            <span className="block h-3.5 w-3.5 rounded-full bg-emerald-900 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
          </div>

          {/* En móvil mostramos el punto centrado */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-8">
            <span className="block h-3.5 w-3.5 rounded-full bg-emerald-900 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
          </div>

          <div className="px-7 py-7">
            <div className="text-sm tracking-wide font-medium text-amber-700 uppercase">
              {year}
            </div>
            <h3 className="mt-2 font-serif text-base sm:text-lg uppercase tracking-wide text-gray-900">
              {title}
            </h3>
            <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-gray-700 font-sans">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


