import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { createPromiseClient } from "@bufbuild/connect";
import type { PromiseClient } from "@bufbuild/connect";
import { jobManageService } from "../../../services/helloworld_connectweb";
import React from "react";

const transport = createGrpcWebTransport({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL as string,
});
const client = createPromiseClient(jobManageService, transport);
export function useClient<T extends typeof jobManageService>(
  service: T
): PromiseClient<T> {
  return React.useMemo(
    () => createPromiseClient(service, transport),
    [service]
  );
}
