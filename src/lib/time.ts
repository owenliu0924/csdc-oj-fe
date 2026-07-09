import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(durationPlugin);
dayjs.extend(relativeTime);

export function utcToLocal(
  utcDt: string | Date | undefined | null,
  format = "YYYY-M-D  HH:mm:ss"
): string {
  if (!utcDt) return "--";
  return dayjs.utc(utcDt).local().format(format);
}

export function duration(
  startTime: string | Date,
  endTime: string | Date
): string {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const d = dayjs.duration(end.diff(start));
  if (d.days() !== 0) {
    return d.humanize();
  }
  return `${Math.abs(Number(d.asHours().toFixed(1)))} hours`;
}

export function secondFormat(seconds: number): string {
  const m = dayjs.duration(seconds, "seconds");
  return `${Math.floor(m.asHours())}:${m.minutes()}:${m.seconds()}`;
}

export { dayjs };
