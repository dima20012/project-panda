import React from 'react';

export const MarkdownText = ({ content }) => {
  if (!content) return null;

  // Simple clean markdown parser for code blocks, bold, italics, links, blockquotes, and lists
  const renderFormatted = (text) => {
    // 1. Code blocks ```js ... ```
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'codeblock', lang: match[1] || 'text', code: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === 'codeblock') {
        return (
          <div key={idx} style={{
            background: '#1e1f22',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '12px',
            margin: '8px 0',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: '#57F287',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {part.lang}
            </div>
            <code>{part.code}</code>
          </div>
        );
      }

      // Format inline elements: bold (**text**), italic (*text*), inline code (`code`), headers (# text)
      const lines = part.content.split('\n');
      return (
        <React.Fragment key={idx}>
          {lines.map((line, lineIdx) => {
            if (line.startsWith('# ')) {
              return <h1 key={lineIdx} style={{ fontSize: '20px', fontWeight: '700', margin: '8px 0', color: 'var(--text-header)' }}>{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={lineIdx} style={{ fontSize: '18px', fontWeight: '700', margin: '6px 0', color: 'var(--text-header)' }}>{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={lineIdx} style={{ fontSize: '16px', fontWeight: '700', margin: '4px 0', color: 'var(--text-header)' }}>{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('- ')) {
              return <li key={lineIdx} style={{ marginLeft: '20px', margin: '2px 0' }}>{line.replace('- ', '')}</li>;
            }

            // Inline replacement
            let formatted = line;
            return (
              <div key={lineIdx} style={{ minHeight: '1.2em' }}>
                <span dangerouslySetInnerHTML={{
                  __html: formatted
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:13px;color:#EB459E">$1</code>')
                }} />
              </div>
            );
          })}
        </React.Fragment>
      );
    });
  };

  return <div>{renderFormatted(content)}</div>;
};
