"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-white group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-grey-foreground",
          actionButton:
            "group-[.toast]:bg-red group-[.toast]:text-red-foreground",
          cancelButton:
            "group-[.toast]:bg-grey group-[.toast]:text-grey-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
