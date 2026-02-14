"use client";

import { CaretDown } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DocumentType } from "@/lib/invoice/types";

interface DocumentTypeSelectorProps {
  documentType: DocumentType;
  onDocumentTypeChange: (type: DocumentType) => void;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "New Invoice",
  quote: "New Quote",
};

export function DocumentTypeSelector({
  documentType,
  onDocumentTypeChange,
}: DocumentTypeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-xl font-semibold hover:opacity-80 transition-opacity outline-none">
        <span>{DOCUMENT_TYPE_LABELS[documentType]}</span>
        <CaretDown size={16} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuRadioGroup
          value={documentType}
          onValueChange={(value) => onDocumentTypeChange(value as DocumentType)}
        >
          <DropdownMenuRadioItem value="invoice">
            New Invoice
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="quote">New Quote</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
