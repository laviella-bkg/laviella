interface SectionHeaderProps {
  scriptText: string
  title: string
  subtitle?: string
}

export function SectionHeader({ scriptText, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-12 text-center">
      <p className="viella-kicker mb-4">{scriptText}</p>
      <h2 className="font-cormorant text-4xl font-semibold leading-[0.95] text-viella-deep md:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl font-dm-sans text-sm font-light leading-7 text-viella-brown md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  )
}
