export type FileNode = {
  parentId?: any;
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
};

export const emptyTree: FileNode[] = [];

export const initialTree: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "index.ts",
        name: "index.ts",
        type: "file",
        content: "console.log('hello world');",
      },
      {
        id: "app.ts",
        name: "app.ts",
        type: "file",
        content: "console.log('hello world');\nconsole.log('app file');\n",
      },
      {
        id: "public",
        name: "src",
        type: "folder",
        children: [
          {
            id: "index.ts",
            name: "index.ts",
            type: "file",
            content: "console.log('hello world');",
          },
          {
            id: "app.ts",
            name: "app.ts",
            type: "file",
            content: "console.log('hello world');\nconsole.log('app file');\n",
          },
        ],
      },
    ],
  },
];
