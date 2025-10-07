// stream json structure
export interface StreamData {
  NumSubs: number;
  Subs: {
    name: string;
    Battery: number;
    TravelPlan: [number, number, number, number][];
  }[];
}