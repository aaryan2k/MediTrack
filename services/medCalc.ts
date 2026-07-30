type Medication = {
  id: string;
  name: string;
  days: string[];
  perDay: string[];
  hours: string[];
};

type DoseState = {
  medication: Medication | null;
  earliestDate: Date | null;
};
  
function computeNextDose(day: number, hour: number, now: Date): Date {
    const nextDose = new Date(now);
    const currentDay = now.getDay();

    let daysUntil = day - currentDay;
    if (daysUntil < 0) daysUntil += 7;

    nextDose.setDate(now.getDate() + daysUntil);
    nextDose.setHours(hour, 0, 0, 0);

    if (nextDose <= now) {
      nextDose.setDate(nextDose.getDate() + 7);
    }

    return nextDose;
}

export function findNextMedication(medications: Medication[], now: Date): DoseState {
    let earliestDate: Date | null = null;
    let nextMedication: Medication | null = null;

    medications.forEach((medication) => {
      medication.days.forEach((day) => {
        medication.hours.forEach((hour) => {
          const nextDose = computeNextDose(Number(day), Number(hour), now);

          if (earliestDate === null || nextDose < earliestDate) {
            earliestDate = nextDose;
            nextMedication = medication;
          }
        });
      });
    });

    return { medication: nextMedication, earliestDate };
}

export function formatTimeUntil(target: Date): string {
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return "Due now";

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function computePreviousDose(day: number, hour: number, now: Date): Date {
    const previousDose = new Date(now);
    const currentDay = now.getDay();

    let daysSince = currentDay - day;
    if (daysSince < 0) daysSince += 7;

    previousDose.setDate(now.getDate() - daysSince);
    previousDose.setHours(hour, 0, 0, 0);

    if (previousDose > now) {
      previousDose.setDate(previousDose.getDate() - 7);
    }

    return previousDose;
}

export function findPreviousMedication(medications: Medication[], now: Date): DoseState {
    let latestDate: Date | null = null;
    let previousMedication: Medication | null = null;

    medications.forEach((medication) => {
      medication.days.forEach((day) => {
        medication.hours.forEach((hour) => {
          const previousDose = computePreviousDose(Number(day), Number(hour), now);

          if (latestDate === null || previousDose > latestDate) {
            latestDate = previousDose;
            previousMedication = medication;
          }
        });
      });
    });

    return { medication: previousMedication, earliestDate: latestDate };
}