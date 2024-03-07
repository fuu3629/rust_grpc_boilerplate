import { Box, Button, Flex, Spacer, useDisclosure } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CreateShiftModal } from "@/components/Home/CreateShiftModal/CreateShiftModal";
import { useContext, useEffect, useState } from "react";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core/index.js";
import { Shift } from "../../../../services/helloworld_pb";
import { useClient } from "@/pages/api/ClientProvider";
import { CokiesContext } from "@/pages/api/CokiesContext";
import { jobManageService } from "../../../../services/helloworld_connectweb";
import { convert } from "../ConfirmCalender/Converter";
import { DeleteModal } from "../DeleteModal/DeleteModal";

export interface CreateShiftCalenderProps {}

export function CreateShiftCalender({}: CreateShiftCalenderProps) {
  const client = useClient(jobManageService);
  const token = useContext(CokiesContext);
  const createModal = useDisclosure();
  //TODO 申請済みの未認証シフトを表示させる
  //TODO 削除モーダルを作成、モーダルが重ならないようにする
  const update = useDisclosure();
  const deleteModal = useDisclosure();
  const [modalInfo, setModalInfo] = useState("");
  const [deleteModalInfo, setDeleteModalInfo] = useState<EventClickArg>();
  const [appliedShifts, setAppliedShifts] = useState<Shift[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const handleSelect = (selectInfo: DateSelectArg) => {
    setModalInfo(selectInfo.startStr);
    createModal.onOpen();
  };
  const handleEventClick = (info: EventClickArg) => {
    setDeleteModalInfo(info);
    deleteModal.onOpen();
  };
  const handleSubmmit = async (shifts: Shift[]) => {
    await client
      .createShift({ shifts }, { headers: { Authorization: token!["auth"] } })
      .then((res) => {
        console.log(res);
      });
    setShifts([]);
  };

  useEffect(() => {
    client
      .getShifts({}, { headers: { Authorization: token!["auth"] } })
      .then((res) => {
        setAppliedShifts(res.shifts.filter((shift) => shift.status === 0));
      });
  }, [deleteModal]);
  return (
    <Box h="85%" w="100%" bg="white">
      <Flex h="10%">
        <Spacer></Spacer>
        <Button
          onClick={() => {
            handleSubmmit(shifts);
          }}
        >
          シフト提出
        </Button>
      </Flex>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        events={convert(shifts, "#3182CE").concat(
          convert(appliedShifts, "#F6AD55")
        )}
        selectable={true}
        select={handleSelect}
        initialView="dayGridMonth"
        locale="ja"
        height={"90%"}
        businessHours={true}
        eventClick={(info) => handleEventClick(info)}
        // datesSet={(info) => console.log(info.start.getMonth())}
      />
      <CreateShiftModal
        shifts={shifts}
        isOpen={createModal.isOpen}
        onCloseModal={createModal.onClose}
        date={modalInfo}
        setShifts={setShifts}
      ></CreateShiftModal>
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onCloseModal={deleteModal.onClose}
        shift={deleteModalInfo!}
      ></DeleteModal>
    </Box>
  );
}
