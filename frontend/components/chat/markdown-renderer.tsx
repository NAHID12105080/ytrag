"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

import { CopyButton } from "@/components/chat/copy-button";

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const code = String(children).replace(/\n$/, "");

    if (!match) {
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div className="group/code relative my-2 overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <span>{match[1]}</span>
          <CopyButton
            value={code}
            className="opacity-0 transition-opacity group-hover/code:opacity-100"
          />
        </div>
        <SyntaxHighlighter
          language={match[1]}
          style={oneDark}
          customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.85em" }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  },
  a({ children, ...props }) {
    return (
      <a {...props} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
        {children}
      </a>
    );
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
