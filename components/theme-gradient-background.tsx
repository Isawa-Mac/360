"use client"

import { cn } from "@/lib/utils"

const WIND_LINES = [
  "M -120 980 C 80 910, 210 760, 340 590 S 520 320, 680 140 S 860 -20, 1040 -90",
  "M -60 1010 C 120 930, 260 770, 390 600 S 580 330, 760 150 S 940 -10, 1120 -70",
  "M 0 995 C 160 920, 300 750, 430 580 S 620 310, 800 130 S 980 -30, 1160 -85",
  "M 60 1025 C 200 940, 340 780, 470 610 S 660 340, 840 160 S 1020 0, 1200 -60",
  "M 120 990 C 280 905, 420 745, 550 575 S 740 305, 920 125 S 1100 -35, 1280 -95",
  "M 180 1015 C 340 930, 480 770, 610 600 S 800 330, 980 150 S 1160 -10, 1340 -75",
  "M 240 1005 C 400 920, 540 760, 670 590 S 860 320, 1040 140 S 1220 -20, 1400 -80",
  "M 300 1030 C 460 945, 600 785, 730 615 S 920 345, 1100 165 S 1280 5, 1460 -55",
  "M 360 995 C 520 910, 660 750, 790 580 S 980 310, 1160 130 S 1340 -30, 1520 -90",
  "M 420 1020 C 580 935, 720 775, 850 605 S 1040 335, 1220 155 S 1400 -5, 1580 -65",
  "M 480 1000 C 640 915, 780 755, 910 585 S 1100 315, 1280 135 S 1460 -25, 1640 -85",
  "M 540 1035 C 700 950, 840 790, 970 620 S 1160 350, 1340 170 S 1520 10, 1700 -50",
  "M 600 990 C 760 905, 900 745, 1030 575 S 1220 305, 1400 125 S 1580 -35, 1760 -95",
  "M 660 1015 C 820 930, 960 770, 1090 600 S 1280 330, 1460 150 S 1640 -10, 1820 -70",
  "M 720 1005 C 880 920, 1020 760, 1150 590 S 1340 320, 1520 140 S 1700 -20, 1880 -80",
  "M 780 1025 C 940 940, 1080 780, 1210 610 S 1400 340, 1580 160 S 1760 0, 1940 -60",
]

type ThemeGradientBackgroundProps = {
  className?: string
}

export function ThemeGradientBackground({ className }: ThemeGradientBackgroundProps) {
  return (
    <div aria-hidden className={cn("theme-gradient-bg absolute inset-0", className)}>
      <svg
        className="h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wind-line-gradient" x1="0" y1="1" x2="0.75" y2="0">
            <stop offset="0%" stopColor="var(--gradient-from)" />
            <stop offset="45%" stopColor="var(--gradient-via)" />
            <stop offset="100%" stopColor="var(--gradient-to)" />
          </linearGradient>
        </defs>

        {WIND_LINES.map((d, index) => (
          <path
            key={index}
            d={d}
            className="theme-gradient-bg__line"
            style={{
              strokeOpacity: 0.18 + (index / (WIND_LINES.length - 1)) * 0.22,
              strokeWidth: 1.1 + (index % 3) * 0.35,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
