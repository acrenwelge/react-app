import dayjs from "dayjs";

export default interface GameResult {
  "_id"?: string,
  "p1": string,
  "p2": string,
  "winner": "p1" | "p2" | "draw",
  "timestamp": dayjs.Dayjs;
}