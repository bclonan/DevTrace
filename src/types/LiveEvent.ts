export type LiveEvent = {
    id: string;
    name: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    participants: string[];
};
