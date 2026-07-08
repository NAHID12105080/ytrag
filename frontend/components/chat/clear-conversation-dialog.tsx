"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ClearConversationDialogProps {
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
}

export function ClearConversationDialog({ onConfirm, disabled }: ClearConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleConfirm() {
    setClearing(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setClearing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" disabled={disabled} />}
      >
        <Trash2 className="size-3.5" /> Clear conversation
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear this conversation?</DialogTitle>
          <DialogDescription>
            This deletes all messages in this chat session. The video&apos;s chat index
            stays intact, so you can keep asking new questions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={clearing}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={clearing}>
            {clearing ? "Clearing..." : "Clear conversation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
