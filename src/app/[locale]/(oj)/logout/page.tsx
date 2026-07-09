"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { useUserStore } from "@/stores/user";
import { Loading } from "@/components/oj/loading";

export default function LogoutPage() {
  const router = useRouter();
  const clearProfile = useUserStore((s) => s.clearProfile);

  useEffect(() => {
    (async () => {
      try {
        await ojApi.logout();
      } catch {

      }
      clearProfile();
      router.replace("/");
    })();
  }, [clearProfile, router]);

  return <Loading />;
}
