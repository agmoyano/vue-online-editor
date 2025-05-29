import fs from 'fs'

const colors = [
  'red',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
]

const variants = ['500/50!', '500/60!', '500/70!', '500/80!', '500/90!', '500/100!']

const prefixes = {
  background: 'bg',
  borderStart: 'border-l',
}

type Result = {
  colors: string[]
  opacity: string[]
  variants: {
    [key: string]: {
      active: string
      inactive: string
      text: string
      background?: string[]
      borderStart?: string[]
    }
  }
}

const result: Result = {
  colors,
  opacity: ['opacity-50', 'opacity-60', 'opacity-70', 'opacity-80', 'opacity-90', 'opacity-100'],
  variants: {},
}

for (const c of colors) {
  const variant: Result['variants'][string] = {
    text: `text-${c}-500`,
    active: `var(--color-${c}-500)`,
    inactive: `--alpha(var(--color-${c}-500), 50%)`,
  }
  for (const p in prefixes) {
    const colorArray: string[] = []
    for (const v of variants) {
      colorArray.push(`${prefixes[p as keyof typeof prefixes]}-${c}-${v}`)
    }
    variant[p] = colorArray
  }
  result.variants[c] = variant
}

fs.writeFileSync('./color-variants.json', JSON.stringify(result, null, 2))
