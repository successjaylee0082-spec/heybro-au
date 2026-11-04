import Image from "next/image";
import { cn } from "@/lib/utils";

export function RedditLogo({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/images/reddit-logo.svg"
      alt=""
      width={size}
      height={size}
      className={cn("inline-block", className)}
      aria-hidden
    />
  );
}
