import { useState } from "react";
import {
  Flex,
  Heading,
  Input,
  Button,
  HStack,
  Text,
  Select,
} from "@chakra-ui/react";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { createPromiseClient } from "@bufbuild/connect";
import { jobManageService } from "../../services/helloworld_connectweb";
import { Group } from "../../services/helloworld_pb";

export default function CreateNewAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [group, setGroup] = useState<Group[]>([]);
  const transport = createGrpcWebTransport({
    baseUrl: "http://127.0.0.1:50051",
  });
  const client = createPromiseClient(jobManageService, transport);
  const groupRes = client.getAllGroup({}).then((res) => {
    const tmp = res.groups;
    setGroup(tmp);
  });

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Flex direction="column" background="gray.100" padding={12} rounded={6}>
        <Heading mb={6}>新規登録</Heading>
        <HStack mb={6}>
          <Text h="100%" w="150px">
            Group
          </Text>
          <Select bg="white" placeholder="Select Group">
            {group.map((g) => (
              <option value={g.groupName} key={g.groupId}>
                {g.groupName}
              </option>
            ))}
          </Select>
        </HStack>
        <HStack mb={6}>
          <Text h="100%" w="150px">
            Email
          </Text>
          <Input
            placeholder="sample@sample.com"
            bg="white"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </HStack>
        <HStack mb={6}>
          <Text h="100%" w="150px">
            User Name
          </Text>
          <Input placeholder="sample" bg="white" />
        </HStack>
        <HStack mb={6}>
          <Text h="100%" w="150px">
            Password
          </Text>
          <Input
            placeholder="********"
            bg="white"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </HStack>
        <Button mb={6} colorScheme="teal">
          crete New Account
        </Button>
      </Flex>
    </Flex>
  );
}
