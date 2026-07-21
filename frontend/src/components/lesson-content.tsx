import ReactMarkdown from "react-markdown";

export function LessonContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: (props) => <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0" {...props} />,
        h2: (props) => <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0" {...props} />,
        h3: (props) => <h4 className="text-sm font-semibold mt-3 mb-1.5" {...props} />,
        p: (props) => <p className="text-sm leading-relaxed mb-3 last:mb-0" {...props} />,
        strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
        ul: (props) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm" {...props} />,
        li: (props) => <li className="leading-relaxed" {...props} />,
        blockquote: (props) => (
          <blockquote className="border-l-2 border-primary pl-4 italic my-3 text-sm" {...props} />
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
