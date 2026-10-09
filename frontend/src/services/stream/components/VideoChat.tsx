'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  PhoneOff,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { User } from '@/types';
import { useWebRTC } from '../hooks/useWebRTC';

export default function VideoChat({
  projectId,
  user,
}: {
  projectId: string;
  user: User | null;
}) {
  const {
    isConnected,
    stream,
    peers,
    micActive,
    videoActive,
    inHuddle,
    joining,
    totalUsers,
    joinHuddle,
    leaveHuddle,
    toggleMic,
    toggleVideo,
  } = useWebRTC(projectId, user);

  const [isExpanded, setIsExpanded] = useState(false);
  const userVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (userVideo.current && stream) userVideo.current.srcObject = stream;
  }, [stream]);

  return (
    <div
      className={`flex flex-col gap-3 p-3 bg-card border border-border rounded-xl ${
        isExpanded ? 'fixed inset-4 z-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-primary" />
          <span className="text-xs font-bold tracking-wide">
            {inHuddle ? `LIVE HUDDLE · ${totalUsers}` : 'VIDEO HUDDLE'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {inHuddle && (
            <>
              <button
                onClick={toggleMic}
                className="p-1.5 rounded-md bg-muted hover:bg-muted/80"
                title={micActive ? 'Mute' : 'Unmute'}
              >
                {micActive ? (
                  <Mic size={14} />
                ) : (
                  <MicOff size={14} className="text-destructive" />
                )}
              </button>
              <button
                onClick={toggleVideo}
                className="p-1.5 rounded-md bg-muted hover:bg-muted/80"
                title={videoActive ? 'Camera off' : 'Camera on'}
              >
                {videoActive ? (
                  <Video size={14} />
                ) : (
                  <VideoOff size={14} className="text-destructive" />
                )}
              </button>
            </>
          )}
          <button
            onClick={() => setIsExpanded((e) => !e)}
            className="p-1.5 rounded-md bg-muted hover:bg-muted/80"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {!inHuddle ? (
        <button
          onClick={joinHuddle}
          disabled={joining || !isConnected}
          className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50"
        >
          {joining ? 'Joining…' : 'Join Huddle'}
        </button>
      ) : (
        <>
          <div
            className={`grid gap-2 ${
              peers.length === 0
                ? 'grid-cols-1'
                : peers.length === 1
                  ? 'grid-cols-2'
                  : 'grid-cols-2'
            }`}
          >
            {/* Local video */}
            <div className="relative group overflow-hidden rounded-lg border border-primary/40 bg-muted aspect-video">
              <video
                ref={userVideo}
                muted
                playsInline
                autoPlay
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-[9px] font-bold text-white">
                You
              </div>
              {!videoActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/95 text-[10px] font-bold text-muted-foreground">
                  Camera Off
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {!micActive && (
                  <MicOff size={10} className="text-destructive" />
                )}
                {!videoActive && (
                  <VideoOff size={10} className="text-destructive" />
                )}
              </div>
            </div>

            {peers.map((peerObj) => (
              <RemoteVideoBox
                key={peerObj.peerID}
                stream={peerObj.stream}
                name={peerObj.name}
                videoEnabled={peerObj.videoEnabled}
                audioEnabled={peerObj.audioEnabled}
              />
            ))}
          </div>

          <button
            onClick={leaveHuddle}
            className="flex items-center justify-center gap-2 w-full py-2 bg-destructive/10 rounded-md text-[10px] font-bold text-destructive hover:bg-destructive/20 transition-colors"
          >
            <PhoneOff size={12} /> Leave Huddle
          </button>
        </>
      )}
    </div>
  );
}

function RemoteVideoBox({
  stream,
  name,
  videoEnabled,
  audioEnabled,
}: {
  stream: MediaStream | null;
  name: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return;
    if (el.srcObject !== stream) el.srcObject = stream;
    el.muted = false;
    el.volume = 1;
    el.play()
      .then(() => setAudioBlocked(false))
      .catch((err) => {
        console.warn('[WebRTC] remote play() blocked:', err);
        setAudioBlocked(true);
      });
  }, [stream]);

  return (
    <div className="relative group overflow-hidden rounded-lg border border-border bg-muted aspect-video">
      <video
        playsInline
        ref={ref}
        autoPlay
        className="w-full h-full object-cover"
      />
      {audioBlocked && (
        <button
          onClick={() =>
            ref.current
              ?.play()
              .then(() => setAudioBlocked(false))
              .catch(() => {})
          }
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-[10px] font-bold text-white"
        >
          🔊 Click to enable audio
        </button>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-[9px] font-bold text-white truncate max-w-[80%]">
        {name}
      </div>

      {!videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/95 text-[10px] font-bold text-muted-foreground">
          {name} - Camera Off
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-1">
        {!audioEnabled && <MicOff size={10} className="text-yellow-500" />}
        {!videoEnabled && <VideoOff size={10} className="text-destructive" />}
      </div>
    </div>
  );
}