import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/motion/page-transition";

export default function OjLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
        <PageTransition>{children}</PageTransition>

      </main>

      <Footer />
    </div>

  );
}
