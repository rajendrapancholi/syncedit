import { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | LiveCode Collab",
  description: "Sign in to your account to start collaborating on code in real-time.",
};

export default function LoginPage() {
    return (
        <LoginForm />
    );
}
