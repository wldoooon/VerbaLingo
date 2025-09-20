import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpFromDot } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative">
      <Input 
        placeholder="Ask Anything here..." 
        className="w-full rounded-3xl h-12 pr-14"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
      />
      <Button 
        size="sm" 
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0"
        onClick={handleSendMessage}
        disabled={isLoading || !inputValue.trim()}
      >
        <ArrowUpFromDot className="h-12 w-12" />
      </Button>
    </div>
  );
};