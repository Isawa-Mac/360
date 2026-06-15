type Rgb = [number, number, number]

const FALLBACK_DARK: Rgb = [0.12, 0.12, 0.12]
const FALLBACK_LIGHT: Rgb = [0.55, 0.55, 0.55]

function parseRgbString(rgb: string): Rgb | null {
  const match = rgb.match(/[\d.]+/g)
  if (!match || match.length < 3) return null
  return [Number(match[0]) / 255, Number(match[1]) / 255, Number(match[2]) / 255]
}

export function cssColorToRgb(color: string): Rgb {
  if (typeof document === "undefined") return FALLBACK_DARK

  const probe = document.createElement("span")
  probe.style.color = color
  probe.style.display = "none"
  document.documentElement.appendChild(probe)
  const parsed = parseRgbString(getComputedStyle(probe).color)
  probe.remove()

  return parsed ?? FALLBACK_DARK
}

export function cssVarToRgb(cssVar: string): Rgb {
  if (typeof document === "undefined") return FALLBACK_DARK

  const probe = document.createElement("span")
  probe.style.color = `var(${cssVar})`
  probe.style.display = "none"
  document.documentElement.appendChild(probe)
  const parsed = parseRgbString(getComputedStyle(probe).color)
  probe.remove()

  return parsed ?? FALLBACK_DARK
}

export function getThemeThreadColors(themeColor: string): { dark: Rgb; light: Rgb } {
  return {
    dark: cssColorToRgb(`color-mix(in oklch, ${themeColor} 78%, black)`),
    light: cssColorToRgb(`color-mix(in oklch, ${themeColor} 72%, white)`),
  }
}

export function readThemeThreadColors(): { dark: Rgb; light: Rgb } {
  if (typeof document === "undefined") {
    return { dark: FALLBACK_DARK, light: FALLBACK_LIGHT }
  }

  const rootStyle = getComputedStyle(document.documentElement)
  const gradientFrom = rootStyle.getPropertyValue("--sidebar-gradient-from").trim()
  const gradientTo = rootStyle.getPropertyValue("--sidebar-gradient-to").trim()

  if (gradientFrom && gradientTo) {
    return {
      dark: cssVarToRgb("--sidebar-gradient-from"),
      light: cssVarToRgb("--sidebar-gradient-to"),
    }
  }

  const themeColor =
    localStorage.getItem("themeColor") ||
    rootStyle.getPropertyValue("--primary").trim() ||
    "oklch(0.205 0 0)"

  return getThemeThreadColors(themeColor)
}
