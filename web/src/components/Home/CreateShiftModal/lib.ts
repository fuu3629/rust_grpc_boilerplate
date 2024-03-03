import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Shift } from "../../../../services/helloworld_pb";
import { PartialMessage, Timestamp } from "@bufbuild/protobuf";

export const CreateShiftSchema = z.object({
  startHour: z.string(),
  startMinute: z.string(),
  endHour: z.string(),
  endMinute: z.string(),
});

export type CreateShiftSchemaType = z.infer<typeof CreateShiftSchema>;

export const useCreateShiftForm = (
  setShifts: Dispatch<SetStateAction<Shift[]>>,
  date: string,
  shifts: Shift[]
) => {
  const { register, handleSubmit, formState, reset } =
    useForm<CreateShiftSchemaType>({
      resolver: zodResolver(CreateShiftSchema),
    });
  const onSubmit = (data: CreateShiftSchemaType) => {
    const start = new Date(
      `${date}T${data.startHour}:${data.startMinute}:00+09:00`
    );
    const end = new Date(`${date}T${data.endHour}:${data.endMinute}:00+09:00`);
    const tmp: Shift = new Shift({
      start: Timestamp.fromDate(start),
      end: Timestamp.fromDate(end),
      status: 0,
    });
    const new_shifts = shifts.concat(tmp);
    console.log(new_shifts);
    setShifts(new_shifts);
    reset();
  };
  return { register, onSubmit: handleSubmit(onSubmit), formState, reset };
};
