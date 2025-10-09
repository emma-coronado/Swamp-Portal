// stream json structure
export interface StreamData {
    num_subs: number;
    Subs: {
            name: string;
            new_reports: number;
            role: string;
            travel_plan: {
                timestamp: number;
                position: { x: number; y: number; z: number };
                orientation: {x: number; y: number; z: number; w: number};
            }[];
            // travel_data: { // historic
            //     timestamp: number;
            //     position: { x: number; y: number; z: number };
            //     orientation: {x: number; y: number; z: number; w: number};
            // }
            avg_deviation: number; // past 1 minute
        }[];
    Events: {
        time: number;
        from: string;
        event_type: string;
        msg: string;
        pos: {x: number; y: number; z: number};
    }[];
}