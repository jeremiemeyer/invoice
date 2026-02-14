import {
  Code as CodeIcon,
  ListBullets as ListBulletsIcon,
  ListChecks as ListChecksIcon,
  ListNumbers as ListNumbersIcon,
  Quotes as QuotesIcon,
  TextAa as TextAaIcon,
  TextHOne as TextHOneIcon,
  TextHThree as TextHThreeIcon,
  TextHTwo as TextHTwoIcon,
} from "@phosphor-icons/react";

export const blockTypeToBlockName: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  paragraph: {
    label: "Paragraph",
    icon: <TextAaIcon className="size-4" />,
  },
  h1: {
    label: "Heading 1",
    icon: <TextHOneIcon className="size-4" />,
  },
  h2: {
    label: "Heading 2",
    icon: <TextHTwoIcon className="size-4" />,
  },
  h3: {
    label: "Heading 3",
    icon: <TextHThreeIcon className="size-4" />,
  },
  number: {
    label: "Numbered List",
    icon: <ListNumbersIcon className="size-4" />,
  },
  bullet: {
    label: "Bulleted List",
    icon: <ListBulletsIcon className="size-4" />,
  },
  check: {
    label: "Check List",
    icon: <ListChecksIcon className="size-4" />,
  },
  code: {
    label: "Code Block",
    icon: <CodeIcon className="size-4" />,
  },
  quote: {
    label: "Quote",
    icon: <QuotesIcon className="size-4" />,
  },
};
