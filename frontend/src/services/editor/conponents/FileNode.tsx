"use client";

import { useState, useEffect } from "react";
import { FileNode } from "@/types/file";
import { useFileTree } from "@/services/editor/hooks/useFileTree";
import {
  ChevronDown,
  ChevronRight,
  File,
  FilePlus2,
  Folder,
  FolderOpen,
  Lock,
  LucideFolderPlus,
  Trash,
} from "lucide-react";
import CreateNode from "../../../components/CreateNode";
import toast from "react-hot-toast";
import Tooltip from "../../../shared/components/Tooltip";

interface FileNodeViewProps {
  node: FileNode;
  onSelect: (file: FileNode) => void;
  projectId: string;
  depth?: number;
  readOnly: boolean;
}

export default function FileNodeView({
  node,
  onSelect,
  projectId,
  depth = 0,
  readOnly = false,
}: FileNodeViewProps) {
  const { create, remove, rename } = useFileTree(projectId);

  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"file" | "folder" | null>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalClick = () => setMenuVisible(false);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuVisible(false);
    };
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleRename = async () => {
    if (newName !== node.name) {
      rename(node.id, node.type, newName);
      toast.success("Renamed successfully");
    }
    setIsEditing(false);
  };

  const handleClick = () => {
    if (node.type === "file") onSelect(node);
    else setExpanded(!expanded);
    setMenuVisible(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setMenuPosition({ x: e.pageX, y: e.pageY });
    setMenuVisible(true);
  };

  const handleCreate = async (name: string, type: "file" | "folder") => {
    if (readOnly) return toast.error("Permission denied");
    const toastId = toast.loading("Creating...");
    try {
      create(node.id, name, type);
      toast.success(`${name} created`, {id: toastId});
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to create!", {id: toastId});
    }
  };

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("nodeId", node.id);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("nodeId");
    if (node.type === "folder" && draggedId !== node.id) {
      console.log(`Moving ${draggedId} into ${node.id}`);
    }
  };

  const handleDelete = async () => {
    try {
      remove(node.id, node.type);
      toast.success("Deleted successfully");
      setMenuVisible(false);
    } catch (error) {
      toast.error("Failed to delete!");
    }
  };

  return (
    <div
      className="relative"
      draggable={!readOnly}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div
        className={`flex items-center gap-1 cursor-pointer px-1 rounded group transition-colors my-0.5 ${
          readOnly ? "hover:bg-zinc-800/50" : "hover:bg-gray-700"
        }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ paddingLeft: depth * 2 }}
      >
        {node.type === "folder" && (
          <span className="w-4 flex-center">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}

        <span>{getFileIcon(node.name, expanded, node.type)}</span>

        {isEditing ? (
          <input
            autoFocus
            className="bg-zinc-800 text-sm border border-primary outline-none px-1 rounded w-full"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
        ) : (
          <span
            className="text-sm truncate py-1"
            onDoubleClick={() => !readOnly && setIsEditing(true)}
          >
            {node.name}
          </span>
        )}

        {!readOnly && node.type === "folder" && (
          <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition px-2">
            <ActionIcon
              icon={<FilePlus2 size={14} />}
              tooltip="New File"
              onClick={() => {
                setModalType("file");
                setIsModalOpen(true);
              }}
            />
            <ActionIcon
              icon={<LucideFolderPlus size={14} />}
              tooltip="New Folder"
              onClick={() => {
                setModalType("folder");
                setIsModalOpen(true);
              }}
            />
            <ActionIcon
              icon={<Trash size={14} />}
              tooltip="Delete"
              onClick={handleDelete}
              isDestructive
            />
          </div>
        )}

        {readOnly && (
          <div className="ml-auto opacity-0 group-hover:opacity-40 transition px-2">
            <Lock size={12} />
          </div>
        )}
      </div>

      {node.children &&
        expanded &&
        node.children.map((child) => (
          <div key={child.id} className="ml-1.75 border-l border-white/5 pl-2">
            <FileNodeView
              node={child}
              onSelect={onSelect}
              projectId={projectId}
              depth={depth + 1}
              readOnly={readOnly}
            />
          </div>
        ))}

      <CreateNode
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType ?? "file"}
        onCreate={handleCreate}
      />

      {/* Context Menu */}
      {menuVisible && (
        <ul
          className="absolute z-50 bg-gray-900 text-white rounded shadow-lg border border-gray-700 min-w-40"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          {node.type === "folder" && (
            <>
              <MenuItem
                label="New File"
                icon={<FilePlus2 size={14} />}
                onClick={() => {
                  setModalType("file");
                  setIsModalOpen(true);
                  setMenuVisible(false);
                }}
              />
              <MenuItem
                label="New Folder"
                icon={<LucideFolderPlus size={14} />}
                onClick={() => {
                  setModalType("folder");
                  setIsModalOpen(true);
                  setMenuVisible(false);
                }}
              />
            </>
          )}
          {!readOnly && (
            <>
              <MenuItem
                label="Rename"
                icon={<FilePlus2 size={14} />}
                onClick={() => {
                  setIsEditing(true);
                  setMenuVisible(false);
                }}
              />
              <MenuItem
                label="Delete"
                icon={<Trash size={14} />}
                onClick={handleDelete}
              />
            </>
          )}
        </ul>
      )}
    </div>
  );
}

function ActionIcon({
  icon,
  tooltip,
  onClick,
  isDestructive = false,
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  isDestructive?: boolean;
}) {
  return (
    <Tooltip content={tooltip} position="top">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`p-1 rounded transition-colors ${
          isDestructive
            ? "hover:text-red-400"
            : "hover:text-white text-gray-400"
        } hover:bg-white/10`}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

function MenuItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <li
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {icon} {label}
    </li>
  );
}

const getFileIcon = (
  name: string,
  expanded: boolean,
  type: "file" | "folder",
) => {
  if (type === "folder") {
    return expanded ? (
      <FolderOpen className="text-amber-400" size={16} />
    ) : (
      <Folder className="text-amber-400" size={16} />
    );
  }

  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return <File className="text-blue-400" size={16} />;
    case "js":
    case "jsx":
      return <File className="text-yellow-400" size={16} />;
    case "css":
      return <File className="text-pink-400" size={16} />;
    case "json":
      return <File className="text-orange-400" size={16} />;
    case "md":
      return <File className="text-gray-500" size={16} />;
    default:
      return <File className="text-zinc-400" size={16} />;
  }
};
