'use client';

import { useState } from "react";
import { socket } from "@/lib/socket";

export default function NewFileModal({
    projectId,
    parentId,
}: {
    projectId: string;
    parentId?: string;
}) {
    const [name, setName] = useState("");

    const createFile = () => {
        if (!name.trim()) return;

        socket.emit("file:create", {
            projectId,
            name,
            type: "file",
            parentId,
        });

        setName("");
    };

    return (
        <div className="flex gap-1">
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="new-file.ts"
                className="bg-zinc-800 text-white px-2 py-1 text-xs rounded"
            />
            <button
                onClick={createFile}
                className="bg-blue-600 text-xs px-2 rounded"
            >
                +
            </button>
        </div>
    );
}
