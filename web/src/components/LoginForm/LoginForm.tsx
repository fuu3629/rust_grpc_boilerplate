import {
  Flex,
  Heading,
  Input,
  Button,
  HStack,
  Text,
  Select,
  FormControl,
  FormErrorMessage,
  Spacer,
  Link,
  Center,
} from "@chakra-ui/react";
import { useLoginForm } from "./lib";
export interface LoginFormProps {}

export function LoginForm({}: LoginFormProps) {
  const { register, onSubmit, formState } = useLoginForm();
  const handleCreateNewAccount = () => {
    window.location.href = "/createNewAccount";
  };
  return (
    <>
      <Flex
        direction="column"
        background="gray.100"
        px={12}
        pt={12}
        pb={6}
        rounded={6}
      >
        <Heading mb={6}>Log in</Heading>{" "}
        <form onSubmit={onSubmit}>
          <HStack mb={6}>
            <Text h="100%" w="150px">
              Email
            </Text>
            <Input
              placeholder="sample@sample.com"
              bg="white"
              {...register("email")}
            />
          </HStack>
          <HStack mb={12}>
            <Text h="100%" w="150px">
              Password
            </Text>
            <Input
              placeholder="********"
              bg="white"
              {...register("password")}
            />
          </HStack>
          <HStack>
            <Spacer></Spacer>
            <Button w={32} mb={16} colorScheme="teal" type="submit">
              Login
            </Button>
          </HStack>
          <Center>
            <Link
              color="blue.400"
              onClick={() => {
                handleCreateNewAccount();
              }}
              _hover={{ cursor: "pointer" }}
            >
              crete New Account
            </Link>
          </Center>
        </form>
      </Flex>
    </>
  );
}
