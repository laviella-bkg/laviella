interface SectionHeaderProps {
  scriptText: string
  title: string
  subtitle?: string
}

export function SectionHeader({ scriptText, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-12">
      <p className="font-dancing text-viella-brown text-lg mb-1">{scriptText}</p>
      <h2 className="font-cormorant font-semibold text-viella-deep text-4xl md:text-5xl leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-dm-sans text-viella-brown text-sm mt-3 max-w-md mx-auto font-light">
          {subtitle}
        </p>
      )}
    </div>
  )
}
