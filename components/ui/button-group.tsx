import * as React from "react"
import { cn } from "@/lib/utils"

const ButtonGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse",
                "[&>[data-slot=button]]:rounded-none [&>[data-slot=button]:first-child]:rounded-s-lg [&>[data-slot=button]:last-child]:rounded-e-lg [&>[data-slot=button]]:shadow-none [&>[data-slot=button]:focus-visible]:z-10",
                className
            )}
            {...props}
        />
    )
})
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
