import { Box, Text } from "@chakra-ui/react";

export interface AppBarProps {}

export function AppBar({}: AppBarProps) {
  return (
    <Box bg="blue.400" px="24px">
      <Text fontSize={"3xl"} color="white">
        シフト管理アプリ
      </Text>
    </Box>
  );
}
