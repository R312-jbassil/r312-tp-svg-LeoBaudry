export enum Collections {
  Svg = "svgs",
  Users = "users",
}

export type SvgRecord = {
  id: string;
  name: string;
  code: string;
  chat_history: string; 
  created: string;
  updated: string;
};
