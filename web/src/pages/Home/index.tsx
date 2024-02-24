import { jobManageService } from "../../../services/helloworld_connectweb";
import { useClient } from "../api/ClientProvider";
import { CokiesContext } from "../api/CokiesContext";
import { useContext, useState, useEffect } from "react";
import { Box, Text, Tab, TabList, Tabs } from "@chakra-ui/react";
import { EventInput } from "@fullcalendar/core";
import { CreateShiftCalender } from "@/components/Home/CreateShiftCalender/CreateShiftCalender";
import { ConfirmCalender } from "@/components/Home/ConfirmCalender/ConfirmCalender";

export default function Home() {
  const client = useClient(jobManageService);
  const token = useContext(CokiesContext);
  const [shifts, setShifts] = useState<EventInput[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [tabIndex, setTabIndex] = useState(0);
  useEffect(() => {
    client
      .getShifts({}, { headers: { Authorization: token!["auth"] } })
      .then((res) => {
        const tmp: EventInput[] = res.shifts.map((shift) => ({
          start: shift.start.split("T")[0],
          end: shift.end.split("T")[0],
          title: `${shift.start
            .split("T")[1]
            .split(":")
            .slice(0, 2)} ~ ${shift.end.split("T")[1].split(":").slice(0, 2)}`,
        }));
        console.log(res);
        setShifts(tmp);
        setTotalTime(res.totalTime);
      });
  }, []);
  console.log(shifts);

  return (
    <Box h="calc(100vh-45px)" w="100%">
      <Box h="5%" bg="white"></Box>
      <Tabs
        isFitted
        variant="enclosed"
        bg="white"
        h="10%"
        onChange={(index) => setTabIndex(index)}
      >
        <TabList mb="1em">
          <Tab>
            <Text fontSize={"xl"}>確定シフト確認</Text>
          </Tab>
          <Tab>
            <Text fontSize={"xl"}>シフト申請</Text>
          </Tab>
        </TabList>
      </Tabs>
      {tabIndex === 0 ? (
        <ConfirmCalender events={shifts}></ConfirmCalender>
      ) : (
        <CreateShiftCalender></CreateShiftCalender>
      )}
    </Box>
  );
}
