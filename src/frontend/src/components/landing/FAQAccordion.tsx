import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

function FAQAccordionItem({ question, answer }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left transition-colors hover:opacity-80"
      >
        <span
          className="font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-textMuted)' }}
        />
      </button>
      <div
        className={`accordion-content ${isOpen ? 'expanded' : 'collapsed'}`}
      >
        <p
          className="pb-5 text-sm leading-relaxed"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
      {items.map((item, index) => (
        <FAQAccordionItem key={index} {...item} />
      ))}
    </div>
  );
}
