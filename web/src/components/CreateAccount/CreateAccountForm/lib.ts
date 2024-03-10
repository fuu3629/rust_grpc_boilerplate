import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { createPromiseClient } from "@bufbuild/connect";
import { jobManageService } from "../../../../services/helloworld_connectweb";
import type { PartialMessage } from "@bufbuild/protobuf";
import { CreateUserRequest } from "../../../../services/helloworld_pb";
import { Dispatch, SetStateAction } from "react";
import { setCookie } from "nookies";

export const createAccountFormSchema = z.object({
  groupId: z.string().min(1, "Group must be selected"),
  userName: z.string().min(1, "User Name must be at least 1 characters"),
  email: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateAccountFormSchemaType = z.infer<
  typeof createAccountFormSchema
>;

export const useCreateAccountForm = (
  setToken: Dispatch<SetStateAction<string>>
) => {
  const { register, handleSubmit, formState } =
    useForm<CreateAccountFormSchemaType>({
      resolver: zodResolver(createAccountFormSchema),
    });
  const onSubmit = async (data: CreateAccountFormSchemaType) => {
    const transport = createGrpcWebTransport({
      baseUrl: "http://127.0.0.1:50051",
    });
    const client = createPromiseClient(jobManageService, transport);
    const req: PartialMessage<CreateUserRequest> = {
      groupId: Number(data.groupId),
      userName: data.userName,
      email: data.email,
      password: data.password,
    };
    const res = await client.createUser(req);
    setToken(res.token);
    setCookie(null, "auth", res.token, {
      maxAge: 60 * 60,
      path: "/",
    });
    window.location.href = "/Home";
  };
  return { register, onSubmit: handleSubmit(onSubmit), formState };
};
