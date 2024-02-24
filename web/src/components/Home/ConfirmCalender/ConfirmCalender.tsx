import { Box, Text } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput } from "@fullcalendar/core";

export interface ConfirmCalenderProps {
  events?: EventInput[];
}

export function ConfirmCalender({ events }: ConfirmCalenderProps) {
  return (
    <Box h="85%" w="100%" bg="white">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale="ja"
        height={"100%"}
        events={events}
      />
    </Box>
  );
}
