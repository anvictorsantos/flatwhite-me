export type Dims = {
  sabor: number
  textura: number
  temperatura: number
  valor: number
}

export type CafeRef = {
  slug: string
  name: string
  price: number | null
}

export type MilkType = 'whole' | 'oat' | 'lactose_free' | 'other'
export type CupSize = 'regular' | 'large'

export type CafeSummary = {
  slug: string
  name: string
  area: string | null
  freguesia: string | null
  specialty: boolean
  score: number | null
  ratings: number
  lastVisit: string | null
  price: number | null
  latitude: number
  longitude: number
  dims: Dims | null
  milkType: MilkType | null
  size: CupSize | null
}

export type SavedCafe = {
  slug: string
  name: string
  area: string | null
  score: number | null
  ratings: number
  lastVisit: string | null
  price: number | null
}

export type StoredRating = {
  id: string
  slug: string
  name: string
  visit: string
  dims: Dims
  price: number
  note: string
  milkType: MilkType
  size: CupSize
  locked: boolean
}
