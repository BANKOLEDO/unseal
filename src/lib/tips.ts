// Optional tips. Set via .env, off while empty.

/** NIM tip address. Null = tips off. */
export const TIP_NIM_ADDRESS: string | null =
  import.meta.env.VITE_TIP_NIM_ADDRESS?.trim() || null

/** Polygon tip address. Null = tips off. */
export const TIP_USDT_ADDRESS: string | null =
  import.meta.env.VITE_TIP_USDT_ADDRESS?.trim() || null

export type TipCurrency = 'NIM' | 'USDT'

/** Preset amounts in human units. First option is always no tip. */
export function tipPresets(currency: TipCurrency): number[] {
  return currency === 'NIM' ? [0, 1, 5] : [0, 0.1, 0.5]
}

/** Treasury address for the currency, or null when tips are off. */
export function tipAddress(currency: TipCurrency): string | null {
  return currency === 'NIM' ? TIP_NIM_ADDRESS : TIP_USDT_ADDRESS
}
