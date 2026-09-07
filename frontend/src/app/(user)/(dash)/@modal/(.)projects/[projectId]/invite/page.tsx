'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import InviteModal from '@/components/InviteModal';

export default function InterceptedInvite({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const { projectId } = use(params);

  return (
    <InviteModal
      isOpen
      onClose={() => router.back()}
      projectId={projectId}
    />
  );
}