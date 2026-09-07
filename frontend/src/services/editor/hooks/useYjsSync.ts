import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { Socket } from 'socket.io-client';

export interface YjsSyncOptions {
  projectId: string;
  fileId: string;
  socket: Socket | null;
}

export const useYjsSync = ({ projectId, fileId, socket }: YjsSyncOptions) => {
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [syncState, setSyncState] = useState<'syncing' | 'synced' | 'error'>(
    'syncing',
  );
  const lastBroadcastVectorRef = useRef<Uint8Array | null>(null);
  const updateDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalUpdateRef = useRef(false);

  // Initialize Yjs document
  useEffect(() => {
    if (!ydocRef.current) {
      ydocRef.current = new Y.Doc();
      ytextRef.current = ydocRef.current.getText('content');
      setSyncState('syncing');
    }

    return () => {
      // Don't destroy doc on unmount, keep it for reuse
    };
  }, []);

  // Request initial state from server, and listen for both the initial
  // snapshot and every subsequent remote update. Without this effect the
  // client can only ever SEND its own edits — it never receives anyone
  // else's, and isReady/syncState never flip to true/'synced', so
  // createYjsBinding (which waits on isReady) never even attaches.
  useEffect(() => {
    if (!socket || !ydocRef.current || !ytextRef.current) return;

    socket.emit('request-yjs-state', { projectId, fileId });

    const handleYjsState = (payload: { fileId: string; state: number[] }) => {
      if (payload.fileId !== fileId || !ydocRef.current) return;

      try {
        const uint8Array = new Uint8Array(payload.state);
        // Tag origin 'socket' so our own broadcast effect below knows
        // this came from the network and does not re-send it.
        Y.applyUpdate(ydocRef.current, uint8Array, 'socket');
        setSyncState('synced');
        setIsReady(true);
      } catch (err) {
        console.error('Failed to apply initial Yjs state:', err);
        setSyncState('error');
      }
    };

    const handleYjsUpdate = (payload: { fileId: string; update: number[] }) => {
      if (payload.fileId !== fileId || !ydocRef.current) return;

      try {
        const uint8Array = new Uint8Array(payload.update);
        Y.applyUpdate(ydocRef.current, uint8Array, 'socket');
      } catch (err) {
        console.error('Failed to apply Yjs update:', err);
        setSyncState('error');
      }
    };

    socket.on('yjs-state', handleYjsState);
    socket.on('yjs-update', handleYjsUpdate);

    return () => {
      socket.off('yjs-state', handleYjsState);
      socket.off('yjs-update', handleYjsUpdate);
    };
  }, [socket, projectId, fileId]);

  // Listen for local changes and broadcast them (coalesced via a short
  // debounce, but diffed against the last-broadcast state vector so no
  // keystroke inside the debounce window is ever silently dropped).
  useEffect(() => {
    if (!socket || !ydocRef.current || !ytextRef.current) return;

    if (!lastBroadcastVectorRef.current) {
      lastBroadcastVectorRef.current = Y.encodeStateVector(new Y.Doc());
    }

    const flush = () => {
      const doc = ydocRef.current;
      if (!doc || !lastBroadcastVectorRef.current) return;

      const diff = Y.encodeStateAsUpdate(doc, lastBroadcastVectorRef.current);
      if (diff.length === 0) return; // nothing new to send

      socket.emit('yjs-update', {
        projectId,
        fileId,
        update: Array.from(diff),
      });
      lastBroadcastVectorRef.current = Y.encodeStateVector(doc);
    };

    const handleUpdate = (_update: Uint8Array, origin: any) => {
      // Skip broadcasting updates that came from the socket — otherwise
      // we'd bounce every remote peer's edits right back at them.
      if (origin === 'socket') return;

      if (updateDebounceRef.current) {
        clearTimeout(updateDebounceRef.current);
      }
      updateDebounceRef.current = setTimeout(flush, 50);
    };

    ydocRef.current.on('update', handleUpdate);

    return () => {
      ydocRef.current?.off('update', handleUpdate);
      if (updateDebounceRef.current) {
        clearTimeout(updateDebounceRef.current);
        // Flush whatever was pending instead of silently dropping it on
        // unmount/file-switch/socket-change (e.g. reconnect mid-burst).
        flush();
      }
    };
  }, [socket, projectId, fileId]);

  const applyLocalChange = (content: string) => {
    if (!ytextRef.current) return;
    isLocalUpdateRef.current = true;

    try {
      ytextRef.current.delete(0, ytextRef.current.length);
      ytextRef.current.insert(0, content);
    } finally {
      isLocalUpdateRef.current = false;
    }
  };

  return {
    ytext: ytextRef.current,
    ydoc: ydocRef.current,
    isReady,
    syncState,
    applyLocalChange,
    getContent: () => ytextRef.current?.toString() || '',
  };
};

// Binding for Monaco/VS Code editor.
// This is the ONLY thing that mutates editor content across clients —
// EditorTab.tsx must not also listen for a separate raw content socket
// event and call model.setValue() itself.
export const createYjsBinding = (
  ytext: Y.Text | null,
  editorInstance: any,
  fileId: string,
  onRemoteChange?: () => void,
  seedContent?: string,
  // Set to true for the duration of a remote-driven model.setValue() call,
  // so a consumer's own onDidChangeModelContent listener (dirty flag,
  // autosave, etc.) can tell it apart from a real local keystroke. Monaco
  // fires content-change events synchronously inside setValue, so a plain
  // boolean ref is enough — no need for anything async.
  remoteChangeRef?: { current: boolean },
) => {
  if (!ytext || !editorInstance) return () => {};

  const model = editorInstance.getModel();
  if (!model) return () => {};

  // First client to bind to this file's (still-empty) Yjs doc seeds it
  // with the file's saved content, so the doc becomes the single source
  // of truth instead of every other joiner starting from a blank buffer.
  if (ytext.length === 0 && seedContent) {
    ytext.insert(0, seedContent);
  }

  const initialContent = ytext.toString();
  if (initialContent && model.getValue() !== initialContent) {
    model.setValue(initialContent);
  }

  const handleYTextChange = (event: Y.YTextEvent) => {
    const newContent = ytext.toString();
    if (model.getValue() !== newContent) {
      const selection = editorInstance.getSelection();
      if (remoteChangeRef) remoteChangeRef.current = true;
      try {
        model.setValue(newContent);
      } finally {
        if (remoteChangeRef) remoteChangeRef.current = false;
      }
      if (selection) {
        editorInstance.setSelection(selection);
      }
      onRemoteChange?.();
    }
  };

  const handleEditorChange = () => {
    // Never feed a remote-originated change back into the Yjs doc — that
    // would just be re-applying content ytext already has, and worse, for
    // a read-only viewer this handler should never mutate shared state.
    if (remoteChangeRef?.current) return;

    const content = model.getValue();
    const currentYContent = ytext.toString();

    if (content !== currentYContent) {
      ytext.doc?.transact(() => {
        ytext.delete(0, ytext.length);
        ytext.insert(0, content);
      });
    }
  };

  ytext.observe(handleYTextChange);
  const disposable =
    editorInstance.onDidChangeModelContent?.(handleEditorChange);

  return () => {
    ytext.unobserve(handleYTextChange);
    disposable?.dispose?.();
  };
};