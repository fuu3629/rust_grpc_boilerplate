import { Shift } from "../../../../services/helloworld_pb";

export interface EventUpdateModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
  shift: Shift;
}

export function EventUpdateModal({
  isOpen,
  onCloseModal,
  shift,
}: EventUpdateModalProps) {
  return (
    <div>
      <h1>EventUpdateModal</h1>
    </div>
  );
}
