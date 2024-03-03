import { Box, Button, Flex, Spacer, useDisclosure } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CreateShiftModal } from "@/components/Home/CreateShiftModal/CreateShiftModal";
import { useContext, useEffect, useState } from "react";
import { DateSelectArg } from "@fullcalendar/core/index.js";
import { Shift } from "../../../../services/helloworld_pb";
import { useClient } from "@/pages/api/ClientProvider";
import { CokiesContext } from "@/pages/api/CokiesContext";
import { jobManageService } from "../../../../services/helloworld_connectweb";
import { convert } from "../ConfirmCalender/Converter";

export interface CreateShiftCalenderProps {}

export function CreateShiftCalender({}: CreateShiftCalenderProps) {
  const client = useClient(jobManageService);
  const token = useContext(CokiesContext);
  const createModal = useDisclosure();
  //TODO 申請済みの未認証シフトを表示させる
  //TODO 削除モーダルを作成、モーダルが重ならないようにする
  const dedleModal = useDisclosure();
  const [modalInfo, setModalInfo] = useState("");
  const [appliedShifts, setAppliedShifts] = useState<Shift[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const handleSelect = (selectInfo: DateSelectArg) => {
    setModalInfo(selectInfo.startStr);
    createModal.onOpen();
  };
  const handleSubmmit = (shifts: Shift[]) => {
    client
      .createShift({ shifts }, { headers: { Authorization: token!["auth"] } })
      .then((res) => {
        console.log(res);
      });
  };

  useEffect(() => {
    client
      .getShifts({}, { headers: { Authorization: token!["auth"] } })
      .then((res) => {
        setShifts(res.shifts.filter((shift) => shift.status === 0));
      });
  }, []);
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
        events={convert(shifts.concat(appliedShifts))}
        selectable={true}
        select={handleSelect}
        initialView="dayGridMonth"
        locale="ja"
        height={"90%"}
        businessHours={true}
        eventClick={(info) => console.log(info.event._def.title)}
        // datesSet={(info) => console.log(info.start.getMonth())}
      />
      <CreateShiftModal
        shifts={shifts}
        isOpen={createModal.isOpen}
        onCloseModal={createModal.onClose}
        date={modalInfo}
        setShifts={setShifts}
      ></CreateShiftModal>
    </Box>
  );
}
