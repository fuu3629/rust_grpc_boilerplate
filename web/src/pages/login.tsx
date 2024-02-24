import { useState } from "react";
import { Flex, Heading, Input, Button } from "@chakra-ui/react";
import { LoginForm } from "@/components";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleCreateNewAccount = () => {
    window.location.href = "/createNewAccount";
  };
  return (
    <Flex height="100vh" alignItems="center" justifyContent="center" w="100%">
      <LoginForm></LoginForm>
    </Flex>
  );
}
