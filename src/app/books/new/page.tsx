import Link from "next/link";
import BookForm from "@/components/BookForm";

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ← 本棚へ戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">本を追加</h1>
      </div>
      <BookForm />
    </div>
  );
}
