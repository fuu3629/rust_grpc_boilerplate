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
} from "@chakra-ui/react";
import { useCreateAccountForm } from "./lib";
import { Group, CreateUserRequest } from "../../../services/helloworld_pb";
import { Dispatch, SetStateAction } from "react";
export interface CreateAccountFormProps {
  group: Group[];
  setToken: Dispatch<SetStateAction<string>>;
}

export function CreateAccountForm({ group, setToken }: CreateAccountFormProps) {
  const { register, onSubmit, formState } = useCreateAccountForm(setToken);
  return (
    <Flex direction="column" background="gray.100" padding={12} rounded={6}>
      <form onSubmit={onSubmit}>
        <Heading mb={6}>新規登録</Heading>
        <HStack mb={6}>
          <Text h="100%" w="150px">
            Group
          </Text>
          <FormControl
            isInvalid={formState.errors.groupId?.type === "undifined"}
          >
            <Select
              bg="white"
              placeholder="Select Group"
              {...register("groupId")}
            >
              {group.map((g) => (
                <option value={g.groupId} key={g.groupId}>
                  {g.groupName}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {formState.errors.groupId && formState.errors.groupId.message}
            </FormErrorMessage>
          </FormControl>
        </HStack>
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
        <HStack mb={6}>
          <Text h="100%" w="150px">
            User Name
          </Text>
          <Input placeholder="sample" bg="white" {...register("userName")} />
        </HStack>
        <HStack mb={6}>
          <Text h="100%" w="150px">
            Password
          </Text>
          <Input placeholder="********" bg="white" {...register("password")} />
        </HStack>
        <HStack>
          <Spacer></Spacer>
          <Button mb={6} colorScheme="teal" type="submit">
            crete New Account
          </Button>
        </HStack>
      </form>
    </Flex>
  );
}
