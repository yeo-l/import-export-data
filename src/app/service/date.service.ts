import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class DateService {

  getDateOfISOWeek(w, y) {
    let simple = new Date(y, 0, 1 + (w - 1) * 7);
    let dow = simple.getDay();
    let ISOWeekStart = simple;
    if (dow <= 4)
      ISOWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOWeekStart.setDate(simple.getDate() + 8 - simple.getDay());

    return ISOWeekStart.toISOString().substring(0, 10);
  }

  getCurrentYear() {
    let currentDay = new Date();
    return currentDay.getFullYear();
  }

  getCurrentWeek() {
    let d: any = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart: any = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7) - 1;
  }

  formatDate(d1:Date, d2:Date) {
    let day = d1.getDate();
    let month = d1.getMonth() + 1;
    let year = d1.getFullYear();
    let dateString1 = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    day = d2.getDate();
    month = d2.getMonth() + 1;
    year = d2.getFullYear();
    let dateString2 = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    return ' ' + dateString1 + ' - ' + dateString2;
  }

  formatDateSimple(d1:Date) {
    let day = d1.getDate();
    let month = d1.getMonth() + 1;
    let year = d1.getFullYear();
    let dateString = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);

    return dateString;
  }

  getMonday(d) {
    d = new Date(d);
    let day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  getSunday(d) {
    d = new Date(d);
    let day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1) + 6; // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    // @ts-ignore
    let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    // Return array of year and week number
    return d.getUTCFullYear() + 'W' + weekNo;
  }

  getDateFromPeriod(d) {
    return new Date((d - (25567 + 1)) * 86400 * 1000);
  }
}
