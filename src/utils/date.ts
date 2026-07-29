export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  if (diffInMs < 0) {
    return 'şimdi'; // In case of slightly future dates due to clock sync
  }

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${Math.max(1, diffInMinutes)} dk önce`;
  } else if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  } else if (diffInDays === 1) {
    return 'Dün';
  } else {
    return `${diffInDays} gün önce`;
  }
}
