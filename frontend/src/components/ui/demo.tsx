import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";

export function DotPatternDemo() {
  return (
    <div className="relative flex h-125 w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
        Dot Pattern
      </p>
      <DotPattern
        className={cn(
          "mask-[radial-gradient(300px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
  );
}
