import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString('en-BD')}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function starRatingLabel(rating: string): string {
  const map: Record<string, string> = { ONE: '1★', TWO: '2★', THREE: '3★', FOUR: '4★', FIVE: '5★' };
  return map[rating] || rating;
}

export function bookingStatusColor(status: string): string {
  const map: Record<string, string> = {
    CONFIRMED: 'text-green-600 bg-green-50',
    PENDING_PAYMENT: 'text-yellow-600 bg-yellow-50',
    CANCELLED: 'text-red-600 bg-red-50',
    CHECKED_IN: 'text-blue-600 bg-blue-50',
    CHECKED_OUT: 'text-gray-600 bg-gray-50',
    EXPIRED: 'text-gray-500 bg-gray-50',
    REFUNDED: 'text-purple-600 bg-purple-50',
  };
  return map[status] || 'text-gray-600 bg-gray-50';
}

export function nightsCount(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
