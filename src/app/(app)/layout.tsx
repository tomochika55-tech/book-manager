import BottomNav from "@/components/BottomNav";

// 認証済みユーザー向けの画面（ホーム・記録・ライブラリ・設定・本の操作系）に
// 共通の背景色とボトムナビゲーションを提供するシェル。
export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-body-md min-h-screen bg-background pb-24 text-on-background">
      {children}
      <BottomNav />
    </div>
  );
}
