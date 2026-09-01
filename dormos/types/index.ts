export interface NavLink {
  label: string
  href: string
}

export interface Feature {
  icon: string
  title: string
  description: string
}

export interface AIFeature {
  icon: string
  title: string
  description: string
  color: string
}

export interface PricingPlan {
  name: string
  price: string
  annualPrice?: string
  period: string
  description: string
  features: string[]
  highlighted: boolean
  cta: string
  badge?: string
}

export interface ProductFact {
  value: string
  label: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface StatItem {
  label: string
  value: string
  change?: string
  positive?: boolean
  icon?: string
}
