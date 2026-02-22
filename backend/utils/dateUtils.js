/**
 * Logic for calculating fineable days:
 * - Excludes Sundays
 * - Excludes 1st and 3rd Saturdays
 * - Excludes given holiday dates
 */

const getFineableDays = (startDate, endDate, holidays = []) => {
    if (!startDate || !endDate || startDate >= endDate) return 0;

    let count = 0;
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    // Holiday dates as strings for easy comparison
    const holidayStrings = holidays.map(h => new Date(h.date).toDateString());

    // We start from the day AFTER the due date
    current.setDate(current.getDate() + 1);

    const targetDate = new Date(endDate);
    targetDate.setHours(0, 0, 0, 0);

    while (current <= targetDate) {
        const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
        const date = current.getDate();
        const month = current.getMonth();
        const year = current.getFullYear();

        let isExcluded = false;

        // 1. Exclude Sundays
        if (dayOfWeek === 0) {
            isExcluded = true;
        }
        // 2. Exclude 1st and 3rd Saturdays
        else if (dayOfWeek === 6) {
            // Find which Saturday of the month this is
            const firstDayOfMonth = new Date(year, month, 1);
            const firstSaturday = (6 - firstDayOfMonth.getDay() + 7) % 7 + 1;

            // Saturdays fall on: firstSaturday, firstSaturday + 7, firstSaturday + 14, firstSaturday + 21, firstSaturday + 28
            const saturdayWeek = Math.floor((date - firstSaturday) / 7) + 1;

            if (saturdayWeek === 1 || saturdayWeek === 3) {
                isExcluded = true;
            }
        }

        // 3. Exclude Holidays
        if (!isExcluded && holidayStrings.includes(current.toDateString())) {
            isExcluded = true;
        }

        if (!isExcluded) {
            count++;
        }

        current.setDate(current.getDate() + 1);
    }

    return count;
};

module.exports = { getFineableDays };
