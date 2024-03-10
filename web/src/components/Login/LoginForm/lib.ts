import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGrpcWebTransport } from "@bufbuild/connect-web";
import { createPromiseClient } from "@bufbuild/connect";
import { jobManageService } from "../../../../services/helloworld_connectweb";
import type { PartialMessage } from "@bufbuild/protobuf";
import { LoginUserRequest } from "../../../../services/helloworld_pb";
import { Dispatch, SetStateAction } from "react";
import { setCookie } from "nookies";

export const loginFormSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type LoginFormSchemaType = z.infer<typeof loginFormSchema>;

export const useLoginForm = () => {
  const { register, handleSubmit, formState } = useForm<LoginFormSchemaType>({
    resolver: zodResolver(loginFormSchema),
  });
  const onSubmit = async (data: LoginFormSchemaType) => {
    const transport = createGrpcWebTransport({
      baseUrl: "http://127.0.0.1:50051",
    });
    const client = createPromiseClient(jobManageService, transport);
    const req: PartialMessage<LoginUserRequest> = {
      email: data.email,
      password: data.password,
    };
    try {
      const res = await client.loginUser(req);
      setCookie(null, "auth", res.token, {
        maxAge: 60 * 60,
        path: "/",
      });
      window.location.href = "/Home";
    } catch (e) {
      alert("Login failed");
    }
  };
  return { register, onSubmit: handleSubmit(onSubmit), formState };
};
