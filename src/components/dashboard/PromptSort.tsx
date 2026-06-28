"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type SortValue = "recent" | "popular";

export function PromptSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort: SortValue =
    searchParams.get("sort") === "popular" ? "popular" : "recent";

  const setSort = (value: SortValue) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "recent") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  return (
    <div
      className="flex items-center gap-1 rounded-lg border p-1"
      role="group"
      aria-label="Сортировка документов"
    >
      <Button
        type="button"
        variant={sort === "recent" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setSort("recent")}
        aria-pressed={sort === "recent"}
      >
        Новые
      </Button>
      <Button
        type="button"
        variant={sort === "popular" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setSort("popular")}
        aria-pressed={sort === "popular"}
      >
        Популярные
      </Button>
    </div>
  );
}
