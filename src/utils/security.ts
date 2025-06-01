
import DOMPurify from 'dompurify';

// Input validation and sanitization
export const sanitizeText = (input: string): string => {
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
};

export const validateUsername = (username: string): boolean => {
  const sanitized = sanitizeText(username);
  // Allow alphanumeric characters, spaces, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9\s\-_]{1,20}$/;
  return validPattern.test(sanitized) && sanitized.length >= 1;
};

export const validateMessage = (message: string): boolean => {
  const sanitized = sanitizeText(message);
  return sanitized.length > 0 && sanitized.length <= 500;
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Allow only http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Generate cryptographically secure room codes
export const generateSecureRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(8); // 8 characters for better security
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
};

// Rate limiting for chat messages
class RateLimiter {
  private timestamps: number[] = [];
  private maxMessages: number;
  private timeWindow: number;

  constructor(maxMessages: number = 10, timeWindowMs: number = 60000) {
    this.maxMessages = maxMessages;
    this.timeWindow = timeWindowMs;
  }

  canSendMessage(): boolean {
    const now = Date.now();
    // Remove old timestamps outside the time window
    this.timestamps = this.timestamps.filter(timestamp => now - timestamp < this.timeWindow);
    
    if (this.timestamps.length >= this.maxMessages) {
      return false;
    }
    
    this.timestamps.push(now);
    return true;
  }

  getRemainingTime(): number {
    if (this.timestamps.length < this.maxMessages) return 0;
    const oldestTimestamp = Math.min(...this.timestamps);
    return Math.max(0, this.timeWindow - (Date.now() - oldestTimestamp));
  }
}

export const chatRateLimiter = new RateLimiter(10, 60000); // 10 messages per minute
