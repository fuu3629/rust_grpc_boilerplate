import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
} from "@chakra-ui/react";
import { useClient } from "@/pages/api/ClientProvider";
import { jobManageService } from "../../../../services/helloworld_connectweb";
import { EventClickArg } from "@fullcalendar/core/index.js";

export interface DeleteModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
  shift?: EventClickArg;
}

export function DeleteModal({ isOpen, onCloseModal, shift }: DeleteModalProps) {
  const client = useClient(jobManageService);
  const onClose = onCloseModal;

  const handleDelete = async () => {
    await client.deleteShift({
      shiftId: shift?.event.extendedProps.shiftId as number,
    });
    onClose();
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent my="auto">
          <ModalHeader>削除しますか？</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{`日付:${shift?.event.start}`}</Text>
            <Text>{`時間:${shift?.event._def.title}`}</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>キャンセル</Button>
            <Button onClick={handleDelete} colorScheme="red">
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
