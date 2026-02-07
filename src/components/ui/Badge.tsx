import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'tech-badge',
        recurring: 'bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff]',
        'one-shot': 'bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] text-amber-400',
        reminder: 'bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-emerald-400',
        scheduled: 'bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-[#00d4ff]',
        'in-progress': 'bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.4)] text-[#00d4ff] status-in-progress',
        done: 'bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-emerald-400 status-done',
        error: 'bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.3)] text-pink-400 status-error',
        paused: 'bg-[rgba(100,116,139,0.1)] border border-[rgba(100,116,139,0.3)] text-slate-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
