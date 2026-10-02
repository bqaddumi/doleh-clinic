export const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const parseDateValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getUnavailableTimes = (
  date: string,
  slotTimes: string[],
  availability: { gapMinutes: number; reservedSlots: string[] }
) => {
  const gapMs = availability.gapMinutes * 60 * 1000;
  const reservedTimes = availability.reservedSlots.map((slot) => new Date(slot).getTime());
  const now = new Date();

  return new Set(
    slotTimes.filter((time) => {
      const slotDate = new Date(`${date}T${time}`);

      if (slotDate <= now) {
        return true;
      }

      return reservedTimes.some((reservedTime) => Math.abs(reservedTime - slotDate.getTime()) < gapMs);
    })
  );
};
