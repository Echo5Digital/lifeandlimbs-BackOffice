// Format date to IST: "05 May 2025 · 3:42 PM"
export function formatIST(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const date = d.toLocaleDateString('en-IN', options).replace(',', '');
  const time = d.toLocaleTimeString('en-IN', timeOptions).toUpperCase().replace('AM', 'AM').replace('PM', 'PM');
  return { date, time };
}

// Format phone as user types: +91 94470 12345
export function formatPhone(value: string): string {
  // Strip everything except digits
  const digits = value.replace(/\D/g, '');
  // Remove country code if present
  const local = digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits;
  const trimmed = local.slice(0, 10);
  if (trimmed.length <= 5) return `+91 ${trimmed}`;
  return `+91 ${trimmed.slice(0, 5)} ${trimmed.slice(5)}`;
}

// Count uploaded documents
export function countDocs(docs: Record<string, string | null>): number {
  return Object.values(docs).filter(Boolean).length;
}

// File size in MB
export function fileSizeMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}
