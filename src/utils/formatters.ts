/**
 * Format number with Indonesian locale
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format date to Indonesian locale
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

/**
 * Format date to short Indonesian locale
 */
export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

/**
 * Format time to Indonesian locale
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Format relative time (e.g., "2 jam yang lalu")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} hari yang lalu`;
  } else if (hours > 0) {
    return `${hours} jam yang lalu`;
  } else if (minutes > 0) {
    return `${minutes} menit yang lalu`;
  } else {
    return 'Baru saja';
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format pond dimensions
 */
export const formatPondSize = (sizeM2: number, depthM: number): string => {
  return `${formatNumber(sizeM2)} m² × ${depthM} m`;
};

/**
 * Format fish age
 */
export const formatFishAge = (ageDays: number): string => {
  if (ageDays < 30) {
    return `${ageDays} hari`;
  }
  
  const months = Math.floor(ageDays / 30);
  const remainingDays = ageDays % 30;
  
  if (remainingDays === 0) {
    return `${months} bulan`;
  }
  
  return `${months} bulan ${remainingDays} hari`;
};

/**
 * Get status label and color
 */
export const getStatusDisplay = (status: string) => {
  const statusMap = {
    active: { label: 'Aktif', color: 'green' },
    inactive: { label: 'Tidak Aktif', color: 'red' },
    maintenance: { label: 'Maintenance', color: 'yellow' },
    pending: { label: 'Menunggu', color: 'blue' },
    completed: { label: 'Selesai', color: 'green' },
    cancelled: { label: 'Dibatalkan', color: 'gray' },
  };
  
  return statusMap[status as keyof typeof statusMap] || { label: status, color: 'gray' };
};