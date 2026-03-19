export interface Moment {
  id: string
  text: string
  timestamp: number
  likes: number
}

export interface LoveStone {
  id: string
  number: number
  weight: number
  label: string
  addedAt: number
}

export interface Milestone {
  id: string
  title: string
  description: string
  date: string
}

export interface HabitCheckins {
  [key: string]: string[]
}
