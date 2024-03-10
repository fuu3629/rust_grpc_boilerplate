import { Box, Button, Text, VStack } from "@chakra-ui/react";

export function SideBar({}) {
  const handleClickManagePage = () => {
    window.location.href = "/ManageLogin";
  };
  return (
    <VStack
      w="240px"
      p="40px"
      bg="white"
      height="calc(100vh - 45px)"
      borderRight={"2px solid #CBD5E0"}
    >
      <Button w="160px" onClick={handleClickManagePage}>
        管理画面
      </Button>
    </VStack>
  );
}
