import { Outlet } from "react-router-dom";
import { Stack } from "@chakra-ui/react";
import BackButton from "../components/BackButton";

export default function MainLayout() {
  return (
    <Stack gap={4} p={4}>
      <BackButton />
      <Outlet />
    </Stack>
  );
}
