import {
  Code,
  ListBullets,
  ListChecks,
  ListNumbers,
  Quotes,
  TextAa,
  TextHOne,
  TextHThree,
  TextHTwo,
} from "@phosphor-icons/react";

export const blockTypeToBlockName: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  paragraph: {
    label: "Paragraph",
    icon: <TextAa className="size-4" />,
  },
  h1: {
    label: "Heading 1",
    icon: <TextHOne className="size-4" />,
  },
  h2: {
    label: "Heading 2",
    icon: <TextHTwo className="size-4" />,
  },
  h3: {
    label: "Heading 3",
    icon: <TextHThree className="size-4" />,
  },
  number: {
    label: "Numbered List",
    icon: <ListNumbers className="size-4" />,
  },
  bullet: {
    label: "Bulleted List",
    icon: <ListBullets className="size-4" />,
  },
  check: {
    label: "Check List",
    icon: <ListChecks className="size-4" />,
  },
  code: {
    label: "Code Block",
    icon: <Code className="size-4" />,
  },
  quote: {
    label: "Quote",
    icon: <Quotes className="size-4" />,
  },
};
