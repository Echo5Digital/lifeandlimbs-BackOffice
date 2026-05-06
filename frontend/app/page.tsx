"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace("/patient-registration"); }, [router]);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-dm,'DM Sans',sans-serif)", color: "#9CA3AF", fontSize: 14 }}>
      Loading...
    </div>
  );
}
