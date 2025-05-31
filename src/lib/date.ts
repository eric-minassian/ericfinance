export class DateString {
  private day: string;
  private month: string;
  private year: string;

  constructor(year: number, month: number, day: number) {
    if (year < 0 || month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error("Invalid date components provided");
    }

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      throw new Error("Year, month, and day must be integers");
    }

    this.year = year.toString();
    this.month = month.toString().padStart(2, "0");
    this.day = day.toString().padStart(2, "0");
  }

  /**
   * Creates a DateString instance from a date string.
   * The date string can be in the format YYYY-MM-DD, YYYY/MM/DD, or MM/DD/YYYY.
   * @param dateString - The date string to parse.
   * @returns A DateString instance representing the parsed date.
   * @throws Will throw an error if the date string is not in a valid format.
   */
  static fromString(dateString: string): DateString {
    const dateParts = dateString.split(/[-/]/);
    if (dateParts.length !== 3) {
      throw new Error("Invalid date string format");
    }
    let year: number, month: number, day: number;
    if (dateParts[0].length === 4) {
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10);
      day = parseInt(dateParts[2], 10);
    } else if (dateParts[2].length === 4) {
      month = parseInt(dateParts[0], 10);
      day = parseInt(dateParts[1], 10);
      year = parseInt(dateParts[2], 10);
    } else {
      throw new Error("Invalid date string format");
    }
    return new DateString(year, month, day);
  }

  toMDYString(): string {
    return `${this.month}/${this.day}/${this.year}`;
  }

  toISOString(): string {
    return `${this.year}-${this.month}-${this.day}`;
  }

  equals(other: DateString): boolean {
    return (
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    );
  }
}
