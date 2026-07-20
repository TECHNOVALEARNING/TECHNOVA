import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  Settings,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseVideoPlayerProps {
  src: string;
  title?: string;
  userEmail?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const CourseVideoPlayer = ({
  src,
  title,
  userEmail = "étudiant@technova.com",
  onEnded,
  autoPlay = false,
}: CourseVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Watermark drifting coordinates (animates every 8 seconds across quadrants)
  const [watermarkPos, setWatermarkPos] = useState<{ top: string; left: string }>({
    top: "15%",
    left: "20%",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const topPositions = ["12%", "35%", "65%", "80%"];
      const leftPositions = ["15%", "45%", "70%", "25%"];
      const randomTop = topPositions[Math.floor(Math.random() * topPositions.length)];
      const randomLeft = leftPositions[Math.floor(Math.random() * leftPositions.length)];
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Controls hide timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
    );
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const cleanSrc = (src || "").trim();

  // Detect whether video is a direct binary video file (.mp4, .webm, .ogg, .mov, .m3u8)
  const isDirectVideo = /\.(mp4|webm|ogg|mov|m3u8)(\?.*)?$/i.test(cleanSrc);
  const isEmbed = !isDirectVideo && cleanSrc.length > 0;

  // Format YouTube/Vimeo/Google Drive/Loom/Iframe URLs cleanly
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const u = url.trim();

    // Check if user pasted full <iframe> code by mistake
    if (u.includes("<iframe") && u.includes("src=")) {
      const match = u.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
    }

    if (u.includes("youtube.com/watch?v=")) {
      const id = u.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=${autoPlay ? 1 : 0}&modestbranding=1&rel=0`;
    }
    if (u.includes("youtube.com/embed/")) {
      return u;
    }
    if (u.includes("youtu.be/")) {
      const id = u.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=${autoPlay ? 1 : 0}&modestbranding=1&rel=0`;
    }
    if (u.includes("vimeo.com/") && !u.includes("player.vimeo.com")) {
      const id = u.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}?autoplay=${autoPlay ? 1 : 0}`;
    }
    if (u.includes("drive.google.com")) {
      return u.replace("/view", "/preview").replace("/edit", "/preview");
    }
    if (u.includes("loom.com/share/")) {
      return u.replace("/share/", "/embed/");
    }
    return u;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group select-none"
    >
      {/* Embed Fallback (YouTube / Vimeo / Cloudflare / Google Drive / Loom Iframe) */}
      {isEmbed ? (
        <div className="relative w-full h-full">
          <iframe
            src={getEmbedUrl(cleanSrc)}
            title={title || "Video Lesson"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        /* Native HTML5 Custom Video Player */
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={src}
            autoPlay={autoPlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Big Play Overlay Button when Paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-20"
            >
              <Play className="h-8 w-8 ml-1 fill-primary-foreground" />
            </button>
          )}

          {/* Custom Controls Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-30"
          >
            {/* Progress Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/90 shrink-0">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 accent-primary bg-white/20 rounded-lg cursor-pointer hover:h-2 transition-all"
              />
              <span className="text-xs font-mono text-white/60 shrink-0">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="h-9 w-9 text-white hover:bg-white/20 rounded-xl"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-white" />
                  ) : (
                    <Play className="h-5 w-5 fill-white" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skipTime(-10)}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
                  title="-10 sec"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skipTime(10)}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
                  title="+10 sec"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>

                {/* Volume Controls */}
                <div className="flex items-center gap-2 ml-2 group/vol">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4 text-red-400" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 accent-primary bg-white/20 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Side Options (Speed & Fullscreen) */}
              <div className="flex items-center gap-2 relative">
                {/* Speed Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="h-8 px-2.5 text-xs text-white/90 font-mono hover:bg-white/20 rounded-xl flex items-center gap-1"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>{playbackSpeed}x</span>
                  </Button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-10 right-0 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 min-w-[90px] z-50">
                      {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => changeSpeed(s)}
                          className={`px-3 py-1 text-xs text-left rounded-lg transition-colors font-mono ${
                            playbackSpeed === s
                              ? "bg-primary text-primary-foreground font-bold"
                              : "text-white/80 hover:bg-white/15"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* DYNAMIC ANTI-PIRACY WATERMARK OVERLAY */}
      <motion.div
        animate={{
          top: watermarkPos.top,
          left: watermarkPos.left,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute z-40 pointer-events-none select-none opacity-40 hover:opacity-10 transition-opacity"
      >
        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white/90 shadow-xl flex items-center gap-1.5 tracking-wider">
          <ShieldAlert className="h-3 w-3 text-amber-400 shrink-0" />
          <span className="font-semibold">{userEmail}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/60">TECHNOVA SECURE</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseVideoPlayer;
