import React, { useEffect, useRef } from "react";

export function Dropdown({
  children,
  isOpen,
  close,
}: React.PropsWithChildren<{ isOpen: boolean; close: () => void }>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, close]);
  if (!isOpen) {
    return null;
  }
  return (
    <div ref={ref} className="absolute bottom-0 h-full w-full">
      <div className="h-full bottom-0"></div>
      <div className="w-full rounded-md bg-black p-3 text-white">
        {children}
      </div>
    </div>
  );
}
