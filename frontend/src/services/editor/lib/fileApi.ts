export async function saveFile(fileId: string, content: string) {
  const res = await fetch(`/api/files/content/${fileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Failed to save file');
  }

  return res.json();
}