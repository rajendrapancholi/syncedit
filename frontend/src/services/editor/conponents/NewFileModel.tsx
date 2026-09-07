'use client';

import { useState } from 'react';
import { useFileTree } from '../hooks/useFileTree';

export default function NewFileModal({
  projectId,
  parentId,
}: {
  projectId: string;
  parentId?: string;
}) {
  const [name, setName] = useState('');
  const { create, isConnected } = useFileTree(projectId);

  const createFile = () => {
    if (!name.trim()) return;

    create(parentId ?? null, name, 'file');
    setName('');
  };

  return (
    <div className="flex gap-1">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="new-file.ts"
        className="bg-zinc-800 text-white px-2 py-1 text-xs rounded"
        disabled={!isConnected}
      />
      <button onClick={createFile} className="bg-blue-600 text-xs px-2 rounded"
      disabled={!isConnected}
      >
        +
      </button>
    </div>
  );
}
