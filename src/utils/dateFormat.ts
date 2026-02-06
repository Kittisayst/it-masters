import { format, parseISO } from 'date-fns'

/**
 * ຈັດຮູບແບບວັນທີເປັນ dd/MM/yyyy
 * @param date - ວັນທີໃນຮູບແບບ string (ISO) ຫຼື Date object
 * @returns ວັນທີໃນຮູບແບບ dd/MM/yyyy
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'dd/MM/yyyy')
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * ຈັດຮູບແບບວັນທີເປັນ dd/MM/yyyy HH:mm
 * @param date - ວັນທີໃນຮູບແບບ string (ISO) ຫຼື Date object
 * @returns ວັນທີແລະເວລາໃນຮູບແບບ dd/MM/yyyy HH:mm
 */
export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'dd/MM/yyyy HH:mm')
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return String(date)
  }
}

/**
 * ສ້າງວັນທີປັດຈຸບັນໃນຮູບແບບ yyyy-MM-dd (ສຳລັບ input date)
 * @returns ວັນທີປັດຈຸບັນ
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
