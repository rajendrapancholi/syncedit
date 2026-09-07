export type User = {
  id: string;
  name: string;
  email: string;
} | null;

export type Cursor = {
  lineNumber: number;
  column: number;
};
