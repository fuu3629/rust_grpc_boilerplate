import { Box, Button, Flex, Spacer, Text } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";
import { useClient } from "@/pages/api/ClientProvider";
import { CokiesContext } from "@/pages/api/CokiesContext";
import events from "events";
import { useContext, useEffect, useState } from "react";
import { jobManageService } from "../../../../services/helloworld_connectweb";
import { Shift } from "../../../../services/helloworld_pb";
import { convert } from "./Converter";

export interface ConfirmCalenderProps {}

export function ConfirmCalender({}: ConfirmCalenderProps) {
  const client = useClient(jobManageService);
  const token = useContext(CokiesContext);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  useEffect(() => {
    client
      .getShifts({}, { headers: { Authorization: token!["auth"] } })
      .then((res) => {
        setShifts(res.shifts.filter((shift) => shift.status === 1));
        setTotalTime(res.totalTime);
      });
  }, []);

  return (
    <Box h="85%" w="100%" bg="white">
      <Flex h="10%">
        <Spacer></Spacer>
        <Text>{`出勤時間:${totalTime}`}</Text>
      </Flex>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale="ja"
        height={"90%"}
        events={convert(shifts)}
        businessHours={true}
      />
    </Box>
  );
}
