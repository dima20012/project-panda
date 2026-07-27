import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#06080d',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      margin: '10px 0',
      fontFamily: 'var(--font-code)',
      fontSize: '13px',
      color: '#00FF87',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        borderBottom: '1px solid var(--glass-border)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        fontWeight: '700'
      }}>
        <span>{lang || 'code'}</span>
        <button 
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? 'var(--neon-emerald)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: '600'
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <div style={{ padding: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
        <code>{code}</code>
      </div>
    </div>
  );
};

export const MarkdownText = ({ content }) => {
  if (!content) return null;

  const renderFormatted = (text) => {
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
        return <CodeBlock key={idx} lang={part.lang} code={part.code} />;
      }

      const lines = part.content.split('\n');
      return (
        <React.Fragment key={idx}>
          {lines.map((line, lineIdx) => {
            if (line.startsWith('# ')) {
              return <h1 key={lineIdx} style={{ fontSize: '20px', fontWeight: '800', margin: '8px 0', color: 'var(--text-primary)' }}>{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={lineIdx} style={{ fontSize: '18px', fontWeight: '800', margin: '6px 0', color: 'var(--text-primary)' }}>{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={lineIdx} style={{ fontSize: '16px', fontWeight: '700', margin: '4px 0', color: 'var(--text-primary)' }}>{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('- ')) {
              return <li key={lineIdx} style={{ marginLeft: '20px', margin: '2px 0' }}>{line.replace('- ', '')}</li>;
            }

            let formatted = line;
            return (
              <div key={lineIdx} style={{ minHeight: '1.2em' }}>
                <span dangerouslySetInnerHTML={{
                  __html: formatted
                    .replace(/\|\|(.*?)\|\|/g, '<span onclick="this.classList.toggle(\'revealed\')" class="spoiler-text" style="filter:blur(5px);background:rgba(255,255,255,0.15);padding:2px 6px;border-radius:4px;cursor:pointer;transition:filter 0.2s" title="Click to reveal spoiler">$1</span>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;font-family:var(--font-code);font-size:13px;color:var(--neon-pink)">$1</code>')
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
