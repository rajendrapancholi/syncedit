import RegisterForm from './RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Create an Account | LiveCode Collab",
  description: "Join the LiveCode Collab community to collaborate on projects in real-time with other developers.",
};


export default function RegisterPage() {
    return (
        <RegisterForm />
    );
}
