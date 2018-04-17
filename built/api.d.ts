import { AxiosPromise } from 'axios';
export declare const getActions: () => AxiosPromise<any>;
export interface FeedbackPayload {
    id: string;
    type: string;
    uid: string;
    action: string;
    question: string;
}
export declare const giveFeedback: (payload: FeedbackPayload) => AxiosPromise<any>;
export declare const getToken: () => AxiosPromise<any>;
