export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.electronAPI && window.electronAPI.isElectron);
};

export const getPlatform = (): string => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI.platform || 'browser';
  }
  return typeof navigator !== 'undefined' ? navigator.platform : 'unknown';
};
