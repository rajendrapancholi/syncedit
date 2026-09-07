import { X } from "lucide-react";
import { useState } from "react";

interface CreateNodeProps {
    isOpen: boolean;
    onClose: () => void;
    type: "file" | "folder";
    onCreate: (name: string, type: "file" | "folder") => void;
    btnType?: "create" | "remove" | "update" | "rename";
}

export default function CreateNode({
    isOpen,
    onClose,
    onCreate,
    type,
    btnType,
}: CreateNodeProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);

        // Validate against regex ^[A-Za-z_][A-Za-z0-9_ ]*(?:\.[A-Za-z0-9_ ]+)*$
        if (value && !/^[A-Za-z_][A-Za-z0-9_ ]*(?:\.[A-Za-z0-9_ ]+)*$/.test(value)) {
            setError('Invalid name. Use letters, numbers, and underscores only. Must start with letter or _.');
        } else {
            setError('');
        }
    };
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onCreate(name, type);
        setName("");
        onClose();
    };
    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            setName('');
            onClose();
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-white">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute group top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none cursor-pointer"
                > <X /> </button>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Create {type}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                        >
                            {type[0].toUpperCase() + type.slice(1)} name *
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            required
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            autoCorrect="off"
                            autoFocus
                            placeholder={`Enter ${type} name...`}
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${error
                                ? 'border-red-500 focus:ring-red-400'
                                : 'border-gray-300 focus:ring-blue-400'
                                } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-2 *:cursor-pointer">
                        <button
                            type="reset"
                            onClick={() => { setName(""); }}
                            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
