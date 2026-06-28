"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  promptId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({
  promptId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);

    const prevLiked = liked;
    const prevCount = count;

    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`/api/prompts/${promptId}/like`, {
        method: "POST",
      });

      const data = (await res.json()) as {
        liked?: boolean;
        likesCount?: number;
        error?: string;
      };

      if (res.status === 401) {
        setLiked(prevLiked);
        setCount(prevCount);
        const query = searchParams.toString();
        const callbackUrl = query ? `${pathname}?${query}` : pathname;
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        setError(data.error ?? "Попробуйте позже");
        return;
      }

      setLiked(data.liked ?? prevLiked);
      setCount(data.likesCount ?? prevCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      setError("Попробуйте позже");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={loading}
        aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
        aria-pressed={liked}
        className="h-8 gap-1.5 px-2"
      >
        <ThumbsUp
          className={cn("h-4 w-4", liked && "fill-primary text-primary")}
        />
        <span className="text-sm tabular-nums">{count}</span>
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
