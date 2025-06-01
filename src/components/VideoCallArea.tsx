import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  isHost: boolean;
  isAdmitted: boolean;
  stream?: MediaStream;
}

interface VideoCallAreaProps {
  users: User[];
  currentUser: User;
  isMuted: boolean;
  isVideoOff: boolean;
}

const VideoCallArea: React.FC<VideoCallAreaProps> = ({ 
  users, 
  currentUser, 
  isMuted, 
  isVideoOff 
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: !isVideoOff,
          audio: !isMuted
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera/microphone:', error);
      }
    };

    initializeCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isMuted, isVideoOff, localStream]);

  return (
    <div className="bg-black/30 backdrop-blur-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-48">
        {/* Current User Video */}
        <Card className="relative bg-gray-900 border-2 border-blue-400">
          <div className="aspect-video relative overflow-hidden rounded">
            {!isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs">
              {currentUser.name} (You)
              {currentUser.isHost && <span className="ml-1 text-yellow-400">👑</span>}
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 p-1 rounded">
              {isMuted ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4 text-green-400" />
              )}
            </div>
          </div>
        </Card>

        {/* Other Users Videos */}
        {users.filter(user => user.id !== currentUser.id).map((user) => (
          <UserVideoCard key={user.id} user={user} />
        ))}

        {/* Empty slots for potential users */}
        {Array.from({ length: Math.max(0, 4 - users.length) }).map((_, index) => (
          <Card key={`empty-${index}`} className="bg-gray-800/50 border-gray-600">
            <div className="aspect-video flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <Video className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">Waiting for user...</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const UserVideoCard: React.FC<{ user: User }> = ({ user }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  return (
    <Card className="relative bg-gray-900 border-gray-600">
      <div className="aspect-video relative overflow-hidden rounded">
        {isVideoEnabled ? (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <div className="text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs">
          {user.name}
          {user.isHost && <span className="ml-1 text-yellow-400">👑</span>}
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          <div className="bg-black/70 p-1 rounded">
            {isMuted ? (
              <MicOff className="w-4 h-4 text-red-400" />
            ) : (
              <Mic className="w-4 h-4 text-green-400" />
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-black/70 hover:bg-black/90"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3 text-red-400" />
            ) : (
              <Volume2 className="w-3 h-3 text-white" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VideoCallArea;
