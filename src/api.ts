import axios, { AxiosPromise } from 'axios';
import * as konsole from './Konsole';

const api = axios.create({
  baseURL: process.env.REACT_APP_CHATBOT_API_BASE_URL
});

export const getActions = () => {
  var uri = '/api/v1/webPersistentOptions?chatbot=' + process.env.REACT_APP_CID;
  return api.get(uri);
};

export interface FeedbackPayload {
  id: string,
  type: string,
  uid: string,
  action: string,
  question: string
}

export const giveFeedback = (payload: FeedbackPayload) => {
  var uri = '/api/v1/webFeedback?chatbot=' + process.env.REACT_APP_CID + '&' +
            'type=' + payload.type + '&' +
            'uid=' + payload.uid + '&' +
            'action=' + payload.action + '&' +
            'question=' + payload.question;
  return api.post(uri);
};

export const getToken = () => {
  var uri = '/api/v1/webGetToken?chatbot=' + process.env.REACT_APP_CID;
  return api.get(uri);
};
