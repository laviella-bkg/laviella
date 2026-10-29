import { Separator } from "@/components/ui/separator"
import { formatUSD } from "@/lib/utils/cms"
import type { PriceCalculation } from "@/lib/types/cms"

export function PriceSummary({ price }: { price: PriceCalculation }) {
  return (
    <div className="space-y-2">
      {price.lines.map((line) => (
        <div key={line.label} className="flex justify-between gap-4 font-dm-sans text-sm text-viella-deep">
          <span>{line.label}</span>
          <span className="whitespace-nowrap">{formatUSD(line.amount)}</span>
        </div>
      ))}
      <Separator className="bg-viella-beige" />
      <div className="flex justify-between font-dm-sans font-semibold text-lg">
        <span className="text-viella-deep">Total</span>
        <span className="text-viella-accent">{formatUSD(price.total)}</span>
      </div>
    </div>
  )
}
