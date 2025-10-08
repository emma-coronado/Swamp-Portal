// stream json structure
export interface StreamData {
  NumSubs: number;
  Subs: {
    Name: string;  // Changed from 'name' to 'Name' to match server data
    Battery: number;
    TravelPlan: [number, number, number, number][];
  }[];
}