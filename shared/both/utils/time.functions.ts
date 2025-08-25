export function getTimeUntilWorkingHours(
  workingHours: number[][],
  timezone: number = 0,
): number {
  const now = new Date();
  const localTime = new Date(now.getTime() + timezone * 60 * 60 * 1000);

  // Check each day starting from today
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const checkDate = new Date(
      localTime.getTime() + daysAhead * 24 * 60 * 60 * 1000,
    );
    const dayOfWeek = checkDate.getUTCDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const dayHours = workingHours[dayIndex];

    // Skip disabled days
    if (!dayHours || dayHours.length === 0) {
      continue;
    }

    const [startMinutes] = dayHours;
    const currentMinutes =
      checkDate.getUTCHours() * 60 + checkDate.getUTCMinutes();

    let targetTime: Date;

    if (daysAhead === 0 && currentMinutes < startMinutes) {
      // Today, but before working hours start
      targetTime = new Date(checkDate.getTime());
      targetTime.setUTCHours(
        Math.floor(startMinutes / 60),
        startMinutes % 60,
        0,
        0,
      );
    } else if (daysAhead > 0) {
      // Future day
      targetTime = new Date(checkDate.getTime());
      targetTime.setUTCHours(
        Math.floor(startMinutes / 60),
        startMinutes % 60,
        0,
        0,
      );
    } else {
      // Today, but after working hours - continue to next day
      continue;
    }

    // Convert back to UTC time
    const utcTargetTime = new Date(
      targetTime.getTime() - timezone * 60 * 60 * 1000,
    );
    return Math.max(0, utcTargetTime.getTime() - now.getTime());
  }

  // If no working hours found in the next 7 days, sleep for 24 hours
  return 24 * 60 * 60 * 1000;
}

export function isWithinWorkingHours(
  workingHours: number[][],
  timezone: number = 0,
): boolean {
  const now = new Date();
  // Adjust for timezone (timezone is offset from UTC in hours)
  const localTime = new Date(now.getTime() + timezone * 60 * 60 * 1000);
  const dayOfWeek = localTime.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

  // Convert to Monday=0, Sunday=6 format to match the working hours array
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const dayHours = workingHours[dayIndex];

  // If day is disabled (empty array), not within working hours
  if (!dayHours || dayHours.length === 0) {
    return false;
  }

  const [startMinutes, endMinutes] = dayHours;
  const currentMinutes =
    localTime.getUTCHours() * 60 + localTime.getUTCMinutes();

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
