'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const handleReturn = () => {
    router.back();
  };
  return (
    <div className="container bg-background">
      <h2 className="text-center text-xl">Not Found</h2>
      <p>Could not find requested resource</p>
      <button onClick={handleReturn}>Return Projects</button>
    </div>
  );
}
