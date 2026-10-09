'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Peer from 'simple-peer';
import toast from 'react-hot-toast';
import { User } from '@/types';

export interface VideoUser {
  socketId: string;
  userId: string;
  name: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

export interface PeerConnection {
  peerID: string;
  peer: any;
  stream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  name: string;
}

function normalizeVideoUser(raw: any, fallbackSocketId?: string): VideoUser {
  return {
    socketId: raw?.socketId || fallbackSocketId || '',
    userId: raw?.userId || raw?.id || '',
    name: raw?.name || 'Unknown',
    videoEnabled: raw?.videoEnabled ?? true,
    audioEnabled: raw?.audioEnabled ?? true,
  };
}

const isMonitorSource = (label: string) => /monitor/i.test(label);

async function getMediaStream(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const audioTrack = stream.getAudioTracks()[0];
  if (!audioTrack || !isMonitorSource(audioTrack.label)) return stream;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const realMic = devices.find(
    (d) =>
      d.kind === 'audioinput' && d.deviceId && !isMonitorSource(d.label),
  );

  if (!realMic) {
    toast.error('Real microphone nahi mila — sirf "Monitor of ..." device hai');
    return stream;
  }

  try {
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: realMic.deviceId } },
    });
    audioTrack.stop();
    stream.removeTrack(audioTrack);
    stream.addTrack(micStream.getAudioTracks()[0]);
  } catch (err) {
    console.warn('Real mic open nahi hua, default hi use ho raha hai:', err);
  }
  return stream;
}

export function useWebRTC(projectId: string, user: User | null) {
  const { socket, isConnected } = useSocket(projectId, user);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<PeerConnection[]>([]);
  const [videoUsers, setVideoUsers] = useState<VideoUser[]>([]);

  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [inHuddle, setInHuddle] = useState(false);
  const [joining, setJoining] = useState(false);

  const peersRef = useRef<PeerConnection[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, any>>(new Map());

  const cleanupPeers = useCallback(() => {
    peersRef.current.forEach((p) => {
      try {
        p.peer.destroy();
      } catch (err) {
        console.error('Error destroying peer:', err);
      }
    });
    peersRef.current = [];
    peerConnectionsRef.current.clear();
    setPeers([]);
  }, []);

  const leaveHuddle = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    cleanupPeers();
    socket?.emit('leave-video-room', { projectId });
    setInHuddle(false);
    setVideoUsers([]);
  }, [socket, projectId, cleanupPeers]);

  const handleUserLeftVideo = useCallback((payload: { socketId: string }) => {
    const peerConn = peerConnectionsRef.current.get(payload.socketId);
    if (peerConn) {
      try {
        peerConn.destroy();
      } catch {}
      peerConnectionsRef.current.delete(payload.socketId);
    }
    setPeers((prev) => prev.filter((p) => p.peerID !== payload.socketId));
    peersRef.current = peersRef.current.filter(
      (p) => p.peerID !== payload.socketId,
    );
    setVideoUsers((prev) =>
      prev.filter((u) => u.socketId !== payload.socketId),
    );
  }, []);

  const createPeerConnection = useCallback(
    (
      targetSocketId: string,
      mySocketId: string,
      currentStream: MediaStream,
      remoteUser: {
        name: string;
        videoEnabled: boolean;
        audioEnabled: boolean;
      },
    ) => {
      if (!targetSocketId || targetSocketId === mySocketId) return;
      if (peerConnectionsRef.current.has(targetSocketId)) return;

      const peer = new Peer({
        initiator: mySocketId > targetSocketId,
        trickle: true,
        stream: currentStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (signal: any) => {
        socket?.emit('webrtc-signal', {
          projectId,
          targetSocketId,
          signal,
          type: signal.type || 'offer',
        });
      });

      const addPeerToList = () => {
        setPeers((prev) => {
          if (prev.find((p) => p.peerID === targetSocketId)) return prev;
          const entry: PeerConnection = {
            peerID: targetSocketId,
            peer,
            stream: null,
            videoEnabled: remoteUser.videoEnabled,
            audioEnabled: remoteUser.audioEnabled,
            name: remoteUser.name || 'Unknown',
          };
          peersRef.current = [
            ...peersRef.current.filter((p) => p.peerID !== targetSocketId),
            entry,
          ];
          return [...prev.filter((p) => p.peerID !== targetSocketId), entry];
        });
      };

      addPeerToList();

      peer.on('stream', (remoteStream: MediaStream) => {
        console.log(
          `[WebRTC] remote stream from ${targetSocketId}`,
          remoteStream
            .getTracks()
            .map((t) => `${t.kind}:${t.readyState}:enabled=${t.enabled}`),
        );
        const withStream = (list: PeerConnection[]) =>
          list.map((p) =>
            p.peerID === targetSocketId ? { ...p, stream: remoteStream } : p,
          );
        peersRef.current = withStream(peersRef.current);
        setPeers(withStream);
      });

      peer.on('error', (err: any) => {
        console.error(`Peer error ${targetSocketId}:`, err);
      });

      peer.on('close', () => {
        peerConnectionsRef.current.delete(targetSocketId);
        setPeers((prev) => prev.filter((p) => p.peerID !== targetSocketId));
        peersRef.current = peersRef.current.filter(
          (p) => p.peerID !== targetSocketId,
        );
      });

      peerConnectionsRef.current.set(targetSocketId, peer);
    },
    [socket, projectId],
  );

  const joinHuddle = useCallback(async () => {
    if (!isConnected || !socket) {
      toast.error('Not connected to server');
      return;
    }
    if (!user) {
      toast.error('User not loaded');
      return;
    }

    setJoining(true);
    try {
      const currentStream = await getMediaStream();
      streamRef.current = currentStream;
      setStream(currentStream);
      setMicActive(true);
      setVideoActive(true);

      socket.emit('join-video-room', {
        projectId,
        user: { id: user.id, name: user.name, email: user.email },
      });
      setInHuddle(true);
      toast.success('Joined video huddle');
    } catch (err) {
      console.error('Media access error:', err);
      toast.error('Camera/Mic access denied');
    } finally {
      setJoining(false);
    }
  }, [isConnected, socket, projectId, user]);

  // socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleVideoRoomUsers = (payload: { users: any[] }) => {
      const currentStream = streamRef.current;
      if (!currentStream || !socket.id) return;

      const newUsers = (payload.users || []).map((u) => normalizeVideoUser(u));
      setVideoUsers(newUsers);

      newUsers.forEach((u) => {
        if (u.socketId && u.socketId !== socket.id) {
          createPeerConnection(u.socketId, socket.id!, currentStream, {
            name: u.name,
            videoEnabled: u.videoEnabled,
            audioEnabled: u.audioEnabled,
          });
        }
      });
    };

    const handleUserJoinedVideo = (payload: {
      socketId: string;
      user: any;
    }) => {
      const currentStream = streamRef.current;
      if (!currentStream || !socket.id) return;
      if (payload.socketId === socket.id) return;

      const normalized = normalizeVideoUser(payload.user, payload.socketId);

      setVideoUsers((prev) => {
        const exists = prev.find((u) => u.socketId === normalized.socketId);
        return exists ? prev : [...prev, normalized];
      });

      createPeerConnection(payload.socketId, socket.id!, currentStream, {
        name: normalized.name,
        videoEnabled: normalized.videoEnabled,
        audioEnabled: normalized.audioEnabled,
      });

      toast.success(`${normalized.name} joined the video`, { icon: '👋' });
    };

    const handleUserLeftVideoEvent = (payload: { socketId: string }) => {
      handleUserLeftVideo(payload);
    };

    const handleVideoStateUpdated = (payload: {
      socketId: string;
      videoEnabled: boolean;
      audioEnabled: boolean;
    }) => {
      setVideoUsers((prev) =>
        prev.map((u) =>
          u.socketId === payload.socketId
            ? {
                ...u,
                videoEnabled: payload.videoEnabled,
                audioEnabled: payload.audioEnabled,
              }
            : u,
        ),
      );

      setPeers((prev) =>
        prev.map((p) =>
          p.peerID === payload.socketId
            ? {
                ...p,
                videoEnabled: payload.videoEnabled,
                audioEnabled: payload.audioEnabled,
              }
            : p,
        ),
      );
    };

    const handleWebRTCSignal = (payload: {
      from: string;
      signal: any;
      type?: string;
    }) => {
      let peerConn = peerConnectionsRef.current.get(payload.from);

      if (
        !peerConn &&
        streamRef.current &&
        socket.id &&
        payload.from !== socket.id
      ) {
        createPeerConnection(payload.from, socket.id, streamRef.current, {
          name: 'Unknown',
          videoEnabled: true,
          audioEnabled: true,
        });
        peerConn = peerConnectionsRef.current.get(payload.from);
      }

      if (peerConn) {
        try {
          peerConn.signal(payload.signal);
        } catch (err) {
          console.error(`Error signaling peer ${payload.from}:`, err);
        }
      }
    };

    const handleWebRTCAnswer = (payload: { from: string; answer: any }) => {
      const peerConn = peerConnectionsRef.current.get(payload.from);
      if (peerConn) {
        try {
          peerConn.signal(payload.answer);
        } catch (err) {
          console.error('Error applying answer:', err);
        }
      }
    };

    const handleWebRTCIceCandidate = (payload: {
      from: string;
      candidate: any;
    }) => {
      const peerConn = peerConnectionsRef.current.get(payload.from);
      if (peerConn && payload.candidate) {
        try {
          if (typeof peerConn.signal === 'function') {
            peerConn.signal(payload.candidate);
          }
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    };

    socket.on('video-room-users', handleVideoRoomUsers);
    socket.on('user-joined-video', handleUserJoinedVideo);
    socket.on('user-left-video', handleUserLeftVideoEvent);
    socket.on('video-state-updated', handleVideoStateUpdated);
    socket.on('webrtc-signal', handleWebRTCSignal);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);

    return () => {
      socket.off('video-room-users', handleVideoRoomUsers);
      socket.off('user-joined-video', handleUserJoinedVideo);
      socket.off('user-left-video', handleUserLeftVideoEvent);
      socket.off('video-state-updated', handleVideoStateUpdated);
      socket.off('webrtc-signal', handleWebRTCSignal);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);
    };
  }, [socket, createPeerConnection, handleUserLeftVideo]);

  const toggleMic = useCallback(() => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      const newState = !micActive;
      audioTracks.forEach((track) => {
        track.enabled = newState;
      });
      setMicActive(newState);
      socket?.emit('video-state-change', {
        projectId,
        videoEnabled: videoActive,
        audioEnabled: newState,
      });
    }
  }, [stream, micActive, videoActive, socket, projectId]);

  const toggleVideo = useCallback(() => {
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      const newState = !videoActive;
      videoTracks.forEach((track) => {
        track.enabled = newState;
      });
      setVideoActive(newState);
      socket?.emit('video-state-change', {
        projectId,
        videoEnabled: newState,
        audioEnabled: micActive,
      });
    }
  }, [stream, videoActive, micActive, socket, projectId]);
  useEffect(() => {
    return () => {
      if (inHuddle) leaveHuddle();
    };
  }, []);

  const totalUsers = inHuddle ? videoUsers.length + 1 : 0;

  return {
    isConnected,
    stream,
    peers,
    videoUsers,
    micActive,
    videoActive,
    inHuddle,
    joining,
    totalUsers,
    joinHuddle,
    leaveHuddle,
    toggleMic,
    toggleVideo,
  };
}