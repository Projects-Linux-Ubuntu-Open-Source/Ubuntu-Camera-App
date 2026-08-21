/**
 * Checks supported video recording MIME types in the current browser
 */
export function getSupportedVideoMimeTypes(): string[] {
  if (typeof window === 'undefined' || !window.MediaRecorder) return [];
  const candidateTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ];
  return candidateTypes.filter((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Checks supported audio recording MIME types in the current browser
 */
export function getSupportedAudioMimeTypes(): string[] {
  if (typeof window === 'undefined' || !window.MediaRecorder) return [];
  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/aac',
    'audio/wav',
  ];
  return candidateTypes.filter((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Returns the best supported video mime type
 */
export function getBestVideoMimeType(): string {
  const supported = getSupportedVideoMimeTypes();
  return supported.length > 0 ? supported[0] : 'video/webm';
}

/**
 * Returns the best supported audio mime type
 */
export function getBestAudioMimeType(): string {
  const supported = getSupportedAudioMimeTypes();
  return supported.length > 0 ? supported[0] : 'audio/webm';
}

/**
 * Generates structured timestamped filename
 */
export function generateFilename(type: 'video' | 'audio' | 'photo', mimeType?: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  const dateStr = `${year}${month}${day}_${hour}${min}${sec}`;

  let ext = 'webm';
  if (type === 'photo') {
    ext = 'png';
  } else if (type === 'audio') {
    if (mimeType?.includes('mp4') || mimeType?.includes('aac')) ext = 'm4a';
    else if (mimeType?.includes('ogg')) ext = 'ogg';
    else if (mimeType?.includes('wav')) ext = 'wav';
    else ext = 'webm';
  } else if (type === 'video') {
    if (mimeType?.includes('mp4')) ext = 'mp4';
    else ext = 'webm';
  }

  return `REC_${type.toUpperCase()}_${dateStr}.${ext}`;
}

/**
 * Converts a Blob to an ArrayBuffer
 */
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}

/**
 * Triggers a browser file download for a Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
