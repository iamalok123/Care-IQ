import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AiMarkdownProps {
  content: string;
  className?: string;
}

export const AiMarkdown: React.FC<AiMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div
      className={`prose prose-sm prose-slate max-w-none text-slate-800 leading-relaxed text-xs sm:text-sm font-normal ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-slate-50 text-slate-700 font-semibold" {...props} />,
          th: ({ ...props }) => <th className="px-3 py-2 text-left font-bold text-slate-800" {...props} />,
          td: ({ ...props }) => <td className="px-3 py-2 border-t border-slate-100 text-slate-700" {...props} />,
          p: ({ ...props }) => <p className="my-1.5 leading-relaxed" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="my-0.5 leading-relaxed" {...props} />,
          strong: ({ ...props }) => <strong className="font-bold text-slate-900" {...props} />,
          code: ({ children, ...props }) => (
            <code
              className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200/60"
              {...props}
            >
              {children}
            </code>
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-teal-500 pl-3.5 py-1 italic text-slate-600 bg-teal-50/40 rounded-r-lg my-2 text-xs"
              {...props}
            />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
