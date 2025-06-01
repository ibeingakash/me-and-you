
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText, validateMessage, chatRateLimiter } from '@/utils/security';

interface Message {
  id: string;
  userName: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface ChatPanelProps {
  roomCode: string;
  userName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ roomCode, userName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userName: 'System',
      text: `Welcome to room ${sanitizeText(roomCode)}!`,
      timestamp: new Date(),
      isSystem: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const sanitizedMessage = sanitizeText(newMessage);
    
    if (!validateMessage(sanitizedMessage)) {
      toast({
        title: "Invalid message",
        description: "Message must be between 1-500 characters.",
        variant: "destructive"
      });
      return;
    }

    if (!chatRateLimiter.canSendMessage()) {
      const remainingTime = Math.ceil(chatRateLimiter.getRemainingTime() / 1000);
      toast({
        title: "Rate limit exceeded",
        description: `Please wait ${remainingTime} seconds before sending another message.`,
        variant: "destructive"
      });
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      userName: sanitizeText(userName),
      text: sanitizedMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-none flex flex-col h-96">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-3">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-64">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg ${
                message.isSystem
                  ? 'bg-blue-500/20 border border-blue-400/30'
                  : message.userName === sanitizeText(userName)
                  ? 'bg-green-500/20 border border-green-400/30 ml-4'
                  : 'bg-gray-500/20 border border-gray-400/30 mr-4'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {!message.isSystem && (
                    <div className="text-xs text-gray-300 mb-1">{sanitizeText(message.userName)}</div>
                  )}
                  <div className="text-white text-sm">{message.text}</div>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type a message... (max 500 chars)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
            onKeyPress={handleKeyPress}
            className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
            maxLength={500}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
