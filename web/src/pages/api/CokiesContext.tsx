import { createContext } from "react";
export const CokiesContext = createContext<
  { [key: string]: string } | undefined
>(undefined);
