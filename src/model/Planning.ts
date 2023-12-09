import {scoringScreenStatus} from '@/enums/scoringScreenStatus';

export interface User {
    name: string;
    socketId: string;
    scores: Array<string>;
}

export interface Planning {
    users: Array<User>;
    scoringScreenStatus: scoringScreenStatus;
    adminName: string;
    showScores: boolean;
    workItemIndex: number | string;
    workItems: Array<any>;
}

export interface Config {
    lang?: string;
    dark?: boolean;
    isAdmin?: boolean;
    userName?: string;
    planningId?: string;
    teamName?: string;
    workItems?: Array<any>;
    autoStart?: boolean;
    planningType?: number;
    activities?: Array<{text: string; value: string}>;
    scoringMetrics?: {columnHeaders: Array<string>; rowHeaders: Array<string>; tableMatrix: Array<Array<number>>};
}
