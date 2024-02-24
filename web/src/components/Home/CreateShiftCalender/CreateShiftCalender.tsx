import { Box, Text } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
export function CreateShiftCalender() {
  return (
    <Box h="85%" w="100%" bg="white">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height={"100%"}
      />
    </Box>
  );
}
