'use client';

import { cn } from '@/lib/utils';
import type { ComponentProps, HTMLAttributes } from 'react';
import { memo } from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import 'katex/dist/katex.min.css';
import hardenReactMarkdown from 'harden-react-markdown';

function parseIncompleteMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return text;

  let result = text;

  const linkImagePattern = /(!?\[)([^\]]*?)$/;
  const linkMatch = result.match(linkImagePattern);
  if (linkMatch) {
    const startIndex = result.lastIndexOf(linkMatch[1]);
    result = result.substring(0, startIndex);
  }

  const boldPattern = /(\*\*)([^*]*?)$/;
  const boldMatch = result.match(boldPattern);
  if (boldMatch) {
    const asteriskPairs = (result.match(/\*\*/g) || []).length;
    if (asteriskPairs % 2 === 1) result = `${result}**`;
  }

  const strikethroughPattern = /(~~)([^~]*?)$/;
  const strikethroughMatch = result.match(strikethroughPattern);
  if (strikethroughMatch) {
    const tildePairs = (result.match(/~~/g) || []).length;
    if (tildePairs % 2 === 1) result = `${result}~~`;
  }

  return result;
}

/** Normalize AI output quirks — skips table rows to avoid breaking table structure */
function preprocessMarkdown(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      // Table rows: leave untouched — converting <br> or • inside cells breaks the table
      if (line.trim().startsWith('|')) return line;
      return line
        .replace(/^[•·▪]\s*/, '- ')
        .replace(/<br\s*\/?>/gi, '\n');
    })
    .join('\n');
}

const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown);

export type ResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options['children'];
  allowedImagePrefixes?: ComponentProps<ReturnType<typeof hardenReactMarkdown>>['allowedImagePrefixes'];
  allowedLinkPrefixes?: ComponentProps<ReturnType<typeof hardenReactMarkdown>>['allowedLinkPrefixes'];
  defaultOrigin?: ComponentProps<ReturnType<typeof hardenReactMarkdown>>['defaultOrigin'];
  parseIncompleteMarkdown?: boolean;
};

const components: Options['components'] = {
  /* ── Block elements ── */
  p: ({ node, children, className, ...props }) => (
    <p className={cn('mt-2 first:mt-0 leading-relaxed text-foreground/90', className)} {...props}>
      {children}
    </p>
  ),

  ul: ({ node, children, className, ...props }) => (
    <ul className={cn('mt-2 ml-0 space-y-1 list-none', className)} {...props}>
      {children}
    </ul>
  ),

  ol: ({ node, children, className, ...props }) => (
    <ol
      className={cn('mt-2 ml-4 space-y-1 list-decimal [&>li::marker]:text-muted-foreground/50 [&>li::marker]:text-xs [&>li::marker]:font-medium', className)}
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ node, children, className, ...props }) => (
    <li className={cn('flex gap-2 items-start leading-relaxed text-foreground/85', className)} {...props}>
      <span className="mt-[6px] shrink-0 size-[4px] rounded-full bg-muted-foreground/45" />
      <span className="flex-1 min-w-0">{children}</span>
    </li>
  ),

  hr: ({ node, className, ...props }) => (
    <hr className={cn('my-3 border-border/40', className)} {...props} />
  ),

  blockquote: ({ node, children, className, ...props }) => (
    <blockquote
      className={cn('my-2 border-l-2 border-primary/50 pl-3 text-muted-foreground/80 italic text-sm leading-relaxed', className)}
      {...props}
    >
      {children}
    </blockquote>
  ),

  /* ── Headings — compact for narrow panel ── */
  h1: ({ node, children, className, ...props }) => (
    <h1 className={cn('mt-5 mb-1.5 font-bold text-base text-foreground tracking-tight first:mt-0', className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2 className={cn('mt-4 mb-1.5 font-bold text-sm text-foreground tracking-tight first:mt-0', className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3 className={cn('mt-3 mb-1 font-semibold text-sm text-foreground/90 first:mt-0', className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn('mt-3 mb-1 font-semibold text-xs uppercase tracking-wider text-muted-foreground first:mt-0', className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5 className={cn('mt-2 mb-0.5 font-semibold text-xs text-muted-foreground first:mt-0', className)} {...props}>
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn('mt-2 mb-0.5 font-medium text-xs text-muted-foreground/70 first:mt-0', className)} {...props}>
      {children}
    </h6>
  ),

  /* ── Inline ── */
  strong: ({ node, children, className, ...props }) => (
    <span className={cn('font-semibold text-foreground', className)} {...props}>
      {children}
    </span>
  ),

  em: ({ node, children, className, ...props }) => (
    <em className={cn('italic text-foreground/80', className)} {...props}>
      {children}
    </em>
  ),

  a: ({ node, children, className, ...props }) => (
    <a
      className={cn('font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors', className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),

  code: ({ node, className, ...props }) => {
    const inline = node?.position?.start.line === node?.position?.end.line;
    if (!inline) return <code className={className} {...props} />;
    return (
      <code
        className={cn('rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 font-mono text-[0.78em]', className)}
        {...props}
      />
    );
  },

  pre: ({ node, className, children, ...props }) => (
    <pre
      className={cn('my-3 overflow-x-auto rounded-lg border border-white/5 bg-zinc-950 px-4 py-3 text-xs text-zinc-200 dark:bg-zinc-900', className)}
      {...props}
    >
      {children}
    </pre>
  ),

  /* ── Table ── */
  table: ({ node, children, className, ...props }) => (
    <div className="my-3 overflow-x-auto max-w-full rounded-lg border border-border/50">
      <table className={cn('w-full border-collapse text-xs', className)} {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, className, ...props }) => (
    <thead className={cn('bg-muted/60', className)} {...props}>{children}</thead>
  ),
  tbody: ({ node, children, className, ...props }) => (
    <tbody className={cn('divide-y divide-border/40', className)} {...props}>{children}</tbody>
  ),
  tr: ({ node, children, className, ...props }) => (
    <tr className={cn('border-b border-border/30 hover:bg-muted/20 transition-colors', className)} {...props}>{children}</tr>
  ),
  th: ({ node, children, className, ...props }) => (
    <th className={cn('px-3 py-2 text-left font-semibold text-xs text-foreground/80 align-top whitespace-nowrap border-r border-border/50 last:border-r-0', className)} {...props}>{children}</th>
  ),
  td: ({ node, children, className, ...props }) => (
    <td className={cn('px-3 py-2 text-xs text-foreground/75 align-top break-words max-w-[240px] border-r border-border/50 last:border-r-0', className)} {...props}>{children}</td>
  ),
};

export const Response = memo(
  ({
    className,
    options,
    children,
    allowedImagePrefixes,
    allowedLinkPrefixes,
    defaultOrigin,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    ...props
  }: ResponseProps) => {
    let processed = typeof children === 'string' ? preprocessMarkdown(children) : children;
    if (typeof processed === 'string' && shouldParseIncompleteMarkdown) {
      processed = parseIncompleteMarkdown(processed);
    }

    return (
      <div
        className={cn('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}
        {...props}
      >
        <HardenedMarkdown
          allowedImagePrefixes={allowedImagePrefixes ?? ['*']}
          allowedLinkPrefixes={allowedLinkPrefixes ?? ['*']}
          components={components}
          defaultOrigin={defaultOrigin}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkGfm, remarkMath]}
          {...options}
        >
          {processed}
        </HardenedMarkdown>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = 'Response';
