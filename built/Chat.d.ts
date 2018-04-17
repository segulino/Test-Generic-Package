/// <reference types="react" />
import * as React from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IBotConnection, User, DirectLineOptions, CardActionTypes } from 'botframework-directlinejs';
import { SpeechOptions } from './SpeechOptions';
import { ActivityOrID, FormatOptions } from './Types';
export interface WdrgyUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}
export interface WdrgyAccount {
    id: number;
    client_number: string;
}
export interface WdrgySessionToken {
    sessionToken: string;
}
export interface ChatProps {
    adaptiveCardsHostConfig: any;
    chatTitle?: boolean | string;
    native?: boolean;
    user: User;
    bot: User;
    botConnection?: IBotConnection;
    directLine?: DirectLineOptions;
    speechOptions?: SpeechOptions;
    locale?: string;
    selectedActivity?: BehaviorSubject<ActivityOrID>;
    sendTyping?: boolean;
    showUploadButton?: boolean;
    formatOptions?: FormatOptions;
    resize?: 'none' | 'window' | 'detect';
    wdrgyUser: WdrgyUser;
    wdrgyAccount: WdrgyAccount;
    wdrgySessionToken: WdrgySessionToken;
    hideActionsPanel: () => void;
    toggleVideoChat: () => void;
}
export declare class Chat extends React.Component<ChatProps, {
    showChat: boolean;
}> {
    private store;
    private botConnection;
    private activitySubscription;
    private connectionStatusSubscription;
    private selectedActivitySubscription;
    private shellRef;
    private historyRef;
    private chatviewPanelRef;
    private resizeListener;
    private _handleCardAction;
    private _handleKeyDownCapture;
    private _saveChatviewPanelRef;
    private _saveHistoryRef;
    private _saveShellRef;
    constructor(props: ChatProps);
    private handleIncomingActivity(activity);
    private setSize();
    private showWelcomeMessage();
    private handleCardAction();
    private handleKeyDownCapture(evt);
    private saveChatviewPanelRef(chatviewPanelRef);
    private saveHistoryRef(historyWrapper);
    private saveShellRef(shellWrapper);
    private toggleChat;
    private toggleFrequentActions;
    private toggleVideoChat;
    private resetChat;
    private createConnectionWithToken();
    private createConnection();
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentWillReceiveProps(nextProps: ChatProps): void;
    render(): JSX.Element;
}
export interface IDoCardAction {
    (type: CardActionTypes, value: string | object): void;
}
export declare const doCardAction: (botConnection: IBotConnection, from: User, locale: string, sendMessage: (value: string, user: User, locale: string) => void) => IDoCardAction;
export declare const sendPostBack: (botConnection: IBotConnection, text: string, value: object, from: User, locale: string) => void;
export declare const renderIfNonempty: (value: any, renderer: (value: any) => JSX.Element) => JSX.Element;
export declare const classList: (...args: (string | boolean)[]) => string;
