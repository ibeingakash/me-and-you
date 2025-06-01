
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Users, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import VideoCallArea from './VideoCallArea';
import MoviePlayer from './MoviePlayer';
import ChatPanel from './ChatPanel';
import UsersList from './UsersList';
import { useToast } from '@/hooks/use-toast';

interface WatchPartyRoomProps {
  roomCode: string;
  userName: string;
  isHost: boolean;
  onLeaveRoom: () => void;
}

interface User {
  id: string;
  name: string;
  isHost: boolean;
  isAdmitted: boolean;
  stream?: MediaStream;
}

const WatchPartyRoom: React.FC<WatchPartyRoomProps> = ({
  roomCode,
  userName,
  isHost,
  onLeaveRoom
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'current',
    name: userName,
    isHost,
    isAdmitted: true
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate some users for demo
    if (isHost) {
      setUsers([
        { id: '1', name: 'Alice', isHost: false, isAdmitted: true },
        { id: '2', name: 'Bob', isHost: false, isAdmitted: false },
      ]);
    }
  }, [isHost]);

  const admitUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isAdmitted: true } : user
    ));
    toast({
      title: "User admitted",
      description: `User has been admitted to the room.`,
    });
  };

  const rejectUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: "User rejected",
      description: `User has been rejected from the room.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">MovieNight</h1>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 px-4 py-2">
                <div className="text-white">
                  <span className="text-sm text-gray-300">Room Code: </span>
                  <span className="font-mono font-bold">{roomCode}</span>
                </div>
              </Card>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowChat(!showChat)}
                className="text-white border-white/30"
              >
                <Users className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button variant="destructive" onClick={onLeaveRoom}>
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Video and Movie Area */}
            <div className="flex-1 flex flex-col">
              {/* Video Call Area */}
              <VideoCallArea
                users={[currentUser, ...users.filter(u => u.isAdmitted)]}
                currentUser={currentUser}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
              />

              {/* Movie Player */}
              <div className="flex-1">
                <MoviePlayer isHost={isHost} />
              </div>
            </div>

            {/* Sidebar */}
            {showChat && (
              <div className="w-80 flex flex-col border-l border-white/20">
                <UsersList
                  users={users}
                  currentUser={currentUser}
                  isHost={isHost}
                  onAdmitUser={admitUser}
                  onRejectUser={rejectUser}
                />
                <ChatPanel roomCode={roomCode} userName={userName} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPartyRoom;
