import React from "react";
import NavBar from "@/components/general/navbar";
import Footer from "@/components/general/footer";

export default function Skeleton({
  children,
}: React.PropsWithChildren<{
  topPad?: number;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <div className="m-4">{children}</div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
