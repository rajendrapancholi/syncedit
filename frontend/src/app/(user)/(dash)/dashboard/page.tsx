import Dashboard from "./Dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your agentic orchestration units",
};

export default function DashboardPage() {
  return (
      <Dashboard />
  );
}
