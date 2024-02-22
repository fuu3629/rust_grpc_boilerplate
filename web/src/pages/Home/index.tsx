import { jobManageService } from "../../../services/helloworld_connectweb";
import { useClient } from "../api/ClientProvider";
import { Shift } from "../../../services/helloworld_pb";
import { CokiesContext } from "../api/CokiesContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useContext, useState, useEffect } from "react";

export default function Home() {
  const client = useClient(jobManageService);
  const token = useContext(CokiesContext);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  useEffect(() => {
    client
      .getShifts({}, { headers: { Authorization: token!["auth"] } })
      .then((res) => {
        setShifts(res.shifts);
        setTotalTime(res.totalTime);
      });
  }, []);

  return (
    <div>
      <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" />
    </div>
  );
}
