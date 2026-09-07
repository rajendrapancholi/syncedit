// components/editor/StatusBar.tsx
import {
  Wifi,
  WifiOff,
  Check,
  CloudUpload,
  Globe,
  Lock,
  Sparkles,
} from 'lucide-react';

interface StatusBarProps {
  line: number;
  col: number;
  language: string;
  isDirty: boolean;
  isConnected: boolean;
  canEdit: boolean;
  hasActiveFile: boolean;
}

export default function StatusBar({
  line,
  col,
  language,
  isDirty,
  isConnected,
  canEdit,
  hasActiveFile,
}: StatusBarProps) {
  return (
    <div
      className={`h-6 flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider select-none shrink-0 transition-colors ${
        canEdit
          ? 'bg-primary text-primary-foreground'
          : 'bg-yellow-600 text-white'
      }`}
    >
      {/* Left: connection + mode + sync */}
      <div className="flex items-center gap-3 h-full">
        <div className="flex items-center gap-1.5 h-full">
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isConnected ? 'Live' : 'Offline'}</span>
        </div>
        <div className="flex items-center gap-1.5 h-full border-l border-white/20 pl-3">
          {canEdit ? <Sparkles size={12} /> : <Lock size={12} />}
          <span>{canEdit ? 'Editing' : 'Read-only'}</span>
        </div>
        {hasActiveFile && (
          <div className="flex items-center gap-1.5 h-full border-l border-white/20 pl-3">
            {isDirty ? (
              <span className="flex items-center gap-1 animate-pulse">
                <CloudUpload size={12} /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Check size={12} /> Synced
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: editor metadata */}
      <div className="flex items-center h-full">
        {hasActiveFile ? (
          <>
            <div className="hover:bg-white/10 px-3 h-full flex items-center transition-colors">
              Ln {line}, Col {col}
            </div>
            <div className="hover:bg-white/10 px-3 h-full flex items-center transition-colors">
              Spaces: 2
            </div>
            <div className="hover:bg-white/10 px-3 h-full flex items-center gap-1.5 transition-colors border-l border-white/10">
              <Globe size={12} />
              {language}
            </div>
          </>
        ) : (
          <div className="px-3 h-full flex items-center opacity-70">
            No file open
          </div>
        )}
      </div>
    </div>
  );
}
