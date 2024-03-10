import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { createPromiseClient } from "@bufbuild/connect";
import { jobManageService } from "../../services/helloworld_connectweb";
import { CreateAccountForm } from "@/components/CreateAccount/CreateAccountForm";
import { Group, CreateUserRequest } from "../../services/helloworld_pb";

export default function CreateNewAccount() {
  const [group, setGroup] = useState<Group[]>([]);
  const [token, setToken] = useState<string>("");
  const transport = createGrpcWebTransport({
    baseUrl: "http://127.0.0.1:50051",
  });
  const client = createPromiseClient(jobManageService, transport);
  useEffect(() => {
    const groupRes = client.getAllGroup({}).then((res) => {
      const tmp = res.groups;
      setGroup(tmp);
    });
  }, []);

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center" w="100%">
      <CreateAccountForm group={group} setToken={setToken} />
    </Flex>
  );
}
