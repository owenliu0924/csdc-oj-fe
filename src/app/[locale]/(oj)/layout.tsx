import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/motion/page-transition";

export default function OjLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell flex min-h-screen min-w-0 max-w-full flex-col">
      <Navbar />
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
