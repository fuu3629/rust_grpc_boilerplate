import { useState } from "react";
import { Flex, Heading, Input, Button } from "@chakra-ui/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleCreateNewAccount = () => {
    window.location.href = "/createNewAccount";
  };
  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Flex direction="column" background="gray.100" padding={12} rounded={6}>
        <Heading mb={6}>Log in</Heading>{" "}
        <Input
          placeholder="sample@sample.com"
          bg="white"
          mb={3}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="********"
          bg="white"
          mb={6}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button mb={3} colorScheme="teal">
          Log in
        </Button>
        <Button
          mb={6}
          colorScheme="teal"
          onClick={() => {
            handleCreateNewAccount();
          }}
        >
          crete New Account
        </Button>
      </Flex>
    </Flex>
  );
}
