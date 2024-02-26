import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { date, z } from "zod";
import { Shift } from "../../../../services/helloworld_pb";

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
    const tmp = {
      start: `${date}T${data.startHour}:${data.startMinute}:00`,
      end: `${date}T${data.endHour}:${data.endMinute}:00`,
      status: 0,
    } as Shift;
    const new_shifts = [...shifts, tmp];
    setShifts(new_shifts);
    console.log(new_shifts);
    reset();
  };
  return { register, onSubmit: handleSubmit(onSubmit), formState, reset };
};
