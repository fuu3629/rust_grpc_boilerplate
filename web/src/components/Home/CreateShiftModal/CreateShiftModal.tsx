import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  Select,
  Text,
} from "@chakra-ui/react";
import { useCreateShiftForm } from "./lib";
import { Dispatch, SetStateAction } from "react";
import { Shift } from "../../../../services/helloworld_pb";

export interface ModalInfo {
  date: string;
}

export interface CreateShiftModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
  date: string;
  shifts: Shift[];
  setShifts: Dispatch<SetStateAction<Shift[]>>;
}

const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const minutes = ["00", "15", "30", "45"];

export function CreateShiftModal({
  isOpen,
  onCloseModal,
  date,
  shifts,
  setShifts,
}: CreateShiftModalProps) {
  const { register, onSubmit, formState, reset } = useCreateShiftForm(
    setShifts,
    date,
    shifts
  );
  const onClose = onCloseModal;
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent my="auto">
          <ModalHeader>{date}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>開始時間</Text>
            <Flex mb="12px">
              <Select {...register("startHour")}>
                {hours.map((hour) => (
                  <option value={hour}>{hour}</option>
                ))}
              </Select>
              <Flex textAlign={"center"} alignItems={"center"} mx="12px">
                時
              </Flex>
              <Select {...register("startMinute")}>
                {minutes.map((minute) => (
                  <option value={minute}>{minute}</option>
                ))}
              </Select>
              <Flex textAlign={"center"} alignItems={"center"} ml="12px">
                分
              </Flex>
            </Flex>
            <Text>終了時間</Text>
            <Flex mb="12px">
              <Select {...register("endHour")}>
                {hours.map((hour) => (
                  <option value={hour}>{hour}</option>
                ))}
              </Select>
              <Flex textAlign={"center"} alignItems={"center"} mx="12px">
                時
              </Flex>
              <Select {...register("endMinute")}>
                {minutes.map((minute) => (
                  <option value={minute}>{minute}</option>
                ))}
              </Select>
              <Flex textAlign={"center"} alignItems={"center"} ml="12px">
                分
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose}>
              Close
            </Button>
            <form onSubmit={onSubmit}>
              <Button colorScheme="blue" type="submit" onClick={onClose}>
                シフト作成
              </Button>
            </form>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
