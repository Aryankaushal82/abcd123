import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Add relative time plugin
dayjs.extend(relativeTime);

// Format date to readable format
export const formatDate = (date) => {
  return dayjs(date).format('MMM D, YYYY h:mm A');
};

// Format date to relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

// Format date for input fields
export const formatDateForInput = (date) => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
};

// Check if date is in the past
export const isDatePast = (date) => {
  return dayjs(date).isBefore(dayjs());
};

// Check if date is today
export const isDateToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

// Get time until date
export const getTimeUntil = (date) => {
  const now = dayjs();
  const then = dayjs(date);
  const diff = then.diff(now, 'minute');
  
  if (diff < 60) {
    return `${diff} minute${diff !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(diff / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
};