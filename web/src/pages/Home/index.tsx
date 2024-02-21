import { useContext, useEffect, useState } from "react";
import { jobManageService } from "../../../services/helloworld_connectweb";
import { useClient } from "../api/ClientProvider";
import { Shift } from "../../../services/helloworld_pb";
import { CokiesContext } from "../api/CokiesContext";

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
  return <div>{totalTime}</div>;
}
