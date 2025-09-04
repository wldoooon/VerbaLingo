import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamingMarkdownProps {
  markdown: string;
  speed?: number;
}

const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({ markdown, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset the text when markdown content changes
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < markdown.length) {
        setDisplayedText((prevText) => prevText + markdown[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [markdown, speed]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {displayedText}
    </ReactMarkdown>
  );
};

export default StreamingMarkdown;
