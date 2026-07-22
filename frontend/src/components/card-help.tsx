"use client";

import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CardHelpProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** A small "?" icon button that opens a modal explaining how to read the section it's placed in. */
export function CardHelp({ title, children, className }: CardHelpProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" className={cn("size-5", className)}>
            <HelpCircle className="size-3.5" />
            <span className="sr-only">About {title}</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <HelpCircle className="size-4" /> {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
