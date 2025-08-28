import { MainLayout } from "@/layouts/MainLayout";
export default function AboutPage() {
  return (
    <MainLayout>
      {/* ✅ wrap your app here */}
      <div>
        <h1>About Page</h1>
        <p>This page is wrapped by RootLayout automatically.</p>
      </div>
    </MainLayout>
  );
}
