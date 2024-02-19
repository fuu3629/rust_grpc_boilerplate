import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function App(
  { Component, pageProps }: AppProps,
  ctx: NextPageContext
) {
  const router = useRouter();
  const cookies = parseCookies(ctx);

  // 第二引数に空配列を指定してマウント・アンマウント毎（CSRでの各画面遷移時）に呼ばれるようにする
  useEffect(() => {
    // CSR用認証チェック

    router.beforePopState(({ url, as, options }) => {
      // ログイン画面とエラー画面遷移時のみ認証チェックを行わない
      if (
        url !== "/login" &&
        url !== "/createNewAccount" &&
        url !== "/_error"
      ) {
        if (typeof cookies.auth === "undefined") {
          // CSR用リダイレクト処理
          window.location.href = "/login";
          return false;
        }
      }
      return true;
    });
  }, []);
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

App.getInitialProps = async (appContext: any) => {
  // SSR用認証チェック

  const cookies = parseCookies(appContext.ctx);
  // ログイン画面とエラー画面遷移時のみ認証チェックを行わない
  if (
    appContext.ctx.pathname !== "/login" &&
    appContext.ctx.pathname !== "/createNewAccount" &&
    appContext.ctx.pathname !== "/_error"
  ) {
    if (typeof cookies.auth === "undefined") {
      // SSR or CSRを判定
      const isServer = typeof window === "undefined";
      if (isServer) {
        console.log("in ServerSide");
        appContext.ctx.res.statusCode = 302;
        appContext.ctx.res.setHeader("Location", "/login");
        return {};
      } else {
        console.log("in ClientSide");
      }
    }
  }
  return {
    pageProps: {
      ...(appContext.Component.getInitialProps
        ? await appContext.Component.getInitialProps(appContext.ctx)
        : {}),
      pathname: appContext.ctx.pathname,
    },
  };
};
