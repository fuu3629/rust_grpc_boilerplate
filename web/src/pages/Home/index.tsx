import { useState } from "react";
import { Box, Text, Tab, TabList, Tabs } from "@chakra-ui/react";
import { CreateShiftCalender } from "@/components/Home/CreateShiftCalender/CreateShiftCalender";
import { ConfirmCalender } from "@/components/Home/ConfirmCalender/ConfirmCalender";

export default function Home() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box h="calc(100vh-45px)" w="100%">
      <Box h="5%" bg="white"></Box>
      <Tabs
        isFitted
        variant="enclosed"
        bg="white"
        h="10%"
        index={tabIndex}
        onChange={(index) => setTabIndex(index)}
      >
        <TabList h="40%">
          <Tab>
            <Text fontSize={"xl"}>確定シフト確認</Text>
          </Tab>
          <Tab>
            <Text fontSize={"xl"}>シフト申請</Text>
          </Tab>
        </TabList>
      </Tabs>
      {tabIndex === 0 ? (
        <ConfirmCalender></ConfirmCalender>
      ) : (
        <CreateShiftCalender></CreateShiftCalender>
      )}
    </Box>
  );
}
