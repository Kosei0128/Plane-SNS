import { SearchableItemGrid } from "@/components/SearchableItemGrid";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16">
      <SearchableItemGrid />
    </main>
  );
}
