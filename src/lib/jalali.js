import moment from 'moment-jalaali';

// Configure moment-jalaali
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export class JalaliHelper {
  /**
   * Get start and end of Jalali month
   */
  static getMonthRange(year, month) {
    const start = moment(`${year}/${month}/01`, 'jYYYY/jM/jD');
    const daysInMonth = start.jDaysInMonth();
    const end = moment(`${year}/${month}/${daysInMonth}`, 'jYYYY/jM/jD');
    
    return {
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
      daysInMonth
    };
  }

  /**
   * Get current Jalali month
   */
  static getCurrentMonth() {
    const now = moment();
    return {
      year: now.jYear(),
      month: now.jMonth() + 1 // 1-based
    };
  }

  /**
   * Get Jalali month name
   */
  static getMonthName(month) {
    const months = [
      'Farvardin', 'Ordibehesht', 'Khordad',
      'Tir', 'Mordad', 'Shahrivar',
      'Mehr', 'Aban', 'Azar',
      'Dey', 'Bahman', 'Esfand'
    ];
    return months[month - 1];
  }

  /**
   * Get Jalali weekday name
   */
  static getWeekdayName(date) {
    const m = moment(date, 'YYYY-MM-DD');
    const weekdays = ['Shanbe', 'Yekshanbe', 'Doshanbe', 'Seshanbe', 'Chaharshanbe', 'Panjshanbe', 'Jomeh'];
    return weekdays[m.day()]; // Saturday = 0
  }

  /**
   * Convert Gregorian to Jalali
   */
  static toJalali(gregorianDate) {
    return moment(gregorianDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
  }

  /**
   * Convert Jalali to Gregorian
   */
  static toGregorian(jalaliDate) {
    return moment(jalaliDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
  }

  /**
   * Get all dates in a Jalali month
   */
  static getDatesInMonth(year, month) {
    const { daysInMonth } = this.getMonthRange(year, month);
    const dates = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const m = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
      dates.push({
        jalaliDate: m.format('jYYYY/jMM/jDD'),
        gregorianDate: m.format('YYYY-MM-DD'),
        day: day,
        weekday: this.getWeekdayName(m.format('YYYY-MM-DD')),
        isWeekend: m.day() === 6 // Friday
      });
    }
    
    return dates;
  }
}