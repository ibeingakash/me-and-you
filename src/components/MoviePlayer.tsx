
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Play, Pause, Volume2, Maximize, Upload, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MoviePlayerProps {
  isHost: boolean;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ isHost }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setHasVideo(true);
      toast({
        title: "Video loaded",
        description: `${file.name} is ready to play`,
      });
    }
  };

  const handleUrlLoad = () => {
    if (videoUrl) {
      setHasVideo(true);
      toast({
        title: "Video loaded",
        description: "Video from URL is ready to play",
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!hasVideo) {
    return (
      <div className="h-full bg-black/30 backdrop-blur-lg p-6 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8 max-w-md w-full">
          <CardContent className="space-y-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Load a Movie</h3>
            
            {isHost ? (
              <>
                <div className="space-y-4">
                  <div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="text-white text-sm">or</div>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter video URL"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                    />
                    <Button
                      onClick={handleUrlLoad}
                      disabled={!videoUrl}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Load from URL
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-300">
                <p>Waiting for the host to load a movie...</p>
                <div className="animate-pulse mt-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                    <Play className="w-8 h-8" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Video Player */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handlePlayPause}
        />
        
        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={handlePlayPause}
          >
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-6">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-lg p-4 space-y-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 text-white text-sm">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
              disabled={!isHost}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-white" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isHost && (
              <span className="text-yellow-400 text-sm">Host controls playback</span>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => videoRef.current?.requestFullscreen()}
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePlayer;
