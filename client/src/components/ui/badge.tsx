import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg shadow-primary/20",
                secondary:
                    "border-transparent bg-white/10 text-secondary-foreground hover:bg-white/20 backdrop-blur-sm",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-lg shadow-destructive/20",
                outline: "text-foreground border-white/20 bg-white/5 backdrop-blur-sm",
                todo: "border-transparent bg-slate-500/20 text-slate-700 dark:text-slate-300",
                inProgress: "border-transparent bg-blue-500/20 text-blue-700 dark:text-blue-300",
                review: "border-transparent bg-amber-500/20 text-amber-700 dark:text-amber-300",
                done: "border-transparent bg-green-500/20 text-green-700 dark:text-green-300",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
