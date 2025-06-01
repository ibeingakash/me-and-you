
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Video, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WatchPartyRoom from './WatchPartyRoom';
import { generateSecureRoomCode, validateUsername, sanitizeText } from '@/utils/security';

const WatchPartyApp = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const { toast } = useToast();

  const createRoom = () => {
    const sanitizedName = sanitizeText(userName);
    if (!validateUsername(sanitizedName)) {
      toast({
        title: "Invalid username",
        description: "Username must be 1-20 characters and contain only letters, numbers, spaces, hyphens, or underscores.",
        variant: "destructive"
      });
      return;
    }
    const newRoomCode = generateSecureRoomCode();
    setCurrentRoom(newRoomCode);
    setIsHost(true);
  };

  const joinRoom = () => {
    const sanitizedName = sanitizeText(userName);
    const sanitizedRoomCode = sanitizeText(roomCode);
    
    if (!validateUsername(sanitizedName)) {
      toast({
        title: "Invalid username",
        description: "Username must be 1-20 characters and contain only letters, numbers, spaces, hyphens, or underscores.",
        variant: "destructive"
      });
      return;
    }

    if (sanitizedRoomCode.length < 6) {
      toast({
        title: "Invalid room code",
        description: "Please enter a valid room code.",
        variant: "destructive"
      });
      return;
    }

    setCurrentRoom(sanitizedRoomCode.toUpperCase());
    setIsHost(false);
  };

  if (currentRoom) {
    return (
      <WatchPartyRoom
        roomCode={currentRoom}
        userName={sanitizeText(userName)}
        isHost={isHost}
        onLeaveRoom={() => {
          setCurrentRoom(null);
          setIsHost(false);
          setRoomCode('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-4xl pt-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            MovieNight
          </h1>
          <p className="text-xl text-gray-300">Watch movies together with friends and family</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name (letters, numbers, spaces only)"
                value={userName}
                onChange={(e) => setUserName(e.target.value.slice(0, 20))}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                maxLength={20}
              />
              <Button
                onClick={createRoom}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                disabled={!userName.trim()}
              >
                <Video className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name (letters, numbers, spaces only)"
                value={userName}
                onChange={(e) => setUserName(e.target.value.slice(0, 20))}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                maxLength={20}
              />
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 10))}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                maxLength={10}
              />
              <Button
                onClick={joinRoom}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={!userName.trim() || !roomCode.trim()}
              >
                <Users className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WatchPartyApp;
