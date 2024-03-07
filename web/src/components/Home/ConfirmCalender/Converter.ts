import { Shift } from "../../../../services/helloworld_pb";

export const convert = (shifts: Shift[], color?: string) => {
  const tmp = shifts.map((shift) => ({
    id: shift.shiftId,
    start: new Date(Number(shift.start?.seconds) * 1000 + 9 * 60 * 60 * 1000),
    end: new Date(Number(shift.end?.seconds) * 1000 + 9 * 60 * 60 * 1000),
    status: shift.status,
  }));
  return tmp.map((shift) => ({
    shiftId: shift.id,
    status: shift.status,
    start: shift.start.toISOString().split("T")[0],
    title: `${shift.start
      .toISOString()
      .split("T")[1]
      .split(":")
      .slice(0, 2)} ~ ${shift.end
      .toISOString()
      .split("T")[1]
      .split(":")
      .slice(0, 2)}`,
    color: color,
  }));
};
