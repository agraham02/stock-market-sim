"use client";

import { Loader2, MessagesSquare, Send, Sparkles } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { toast } from "sonner";

import { LessonContent } from "@/components/lesson-content";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useSendTutorMessage, useTutorHistory } from "@/hooks/use-tutor";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ChatContextType } from "@/lib/types";

export interface TutorButtonHandle {
  /** Opens the tutor sheet with a prefilled (editable, not auto-sent) draft message. */
  openWithDraft: (text: string) => void;
}

interface TutorButtonProps {
  contextType: ChatContextType;
  contextId: string | null;
  label?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export const TutorButton = forwardRef<TutorButtonHandle, TutorButtonProps>(function TutorButton(
  { contextType, contextId, label = "Ask AI Tutor", size = "sm", variant = "outline" },
  ref
) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useImperativeHandle(ref, () => ({
    openWithDraft: (text: string) => {
      setDraft(text);
      setOpen(true);
    },
  }));

  const { data: history, isPending: historyPending } = useTutorHistory(contextType, contextId);
  const sendMessage = useSendTutorMessage(contextType, contextId);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const message = draft.trim();
    if (!message) return;
    setDraft("");
    sendMessage.mutate(message, {
      onError: (error) => {
        toast.error(error instanceof ApiError ? error.message : "Tutor request failed");
        setDraft(message);
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant={variant} size={size}>
            <Sparkles className="size-4" /> {label}
          </Button>
        }
      />
      <SheetContent className="flex flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-1.5">
            <MessagesSquare className="size-4" /> AI Tutor
          </SheetTitle>
          <SheetDescription>Grounded in what&apos;s on screen right now — ask why, not just what.</SheetDescription>
        </SheetHeader>

        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="flex-1 px-4">
            <MessageScrollerViewport>
              <MessageScrollerContent>
                {historyPending && <p className="text-sm text-muted-foreground">Loading…</p>}
                {history?.length === 0 && !historyPending && (
                  <p className="text-sm text-muted-foreground">
                    Ask anything about what you&apos;re looking at — the tutor sees the same context you do.
                  </p>
                )}
                {history?.map((msg) => (
                  <MessageScrollerItem key={msg.id} messageId={String(msg.id)} scrollAnchor={msg.role === "user"}>
                    <Message align={msg.role === "user" ? "end" : "start"}>
                      <MessageContent>
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 max-w-[85%]",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground text-sm"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {msg.role === "assistant" ? <LessonContent markdown={msg.content} /> : msg.content}
                        </div>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
                {sendMessage.isPending && !sendMessage.streamingText && (
                  <MessageScrollerItem messageId="pending">
                    <Message align="start">
                      <MessageContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2 w-fit">
                          <Loader2 className="size-3.5 animate-spin" /> Thinking…
                        </div>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
                {sendMessage.isPending && sendMessage.streamingText && (
                  <MessageScrollerItem messageId="streaming" scrollAnchor>
                    <Message align="start">
                      <MessageContent>
                        <div className="rounded-lg px-3 py-2 max-w-[85%] bg-muted text-foreground">
                          <LessonContent markdown={sendMessage.streamingText} />
                        </div>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>

        <SheetFooter>
          <form onSubmit={handleSend} className="flex items-end gap-2 w-full">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask a question…"
              rows={2}
              className="flex-1 resize-none"
            />
            <Button type="submit" size="icon" disabled={!draft.trim() || sendMessage.isPending}>
              <Send className="size-4" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});
