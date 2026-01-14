"use client";
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const MobileNotice = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle> Important Notice</DialogTitle>
            <DialogDescription>
              You should use a desktop computer. <br /> This is not really
              responsive yet.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
};

export default MobileNotice;
