/// <reference types="react" />
import * as React from 'react';
import { Activity } from 'botframework-directlinejs';
import { FormatState, SizeState } from './Store';
import { IDoCardAction } from './Chat';
export interface HistoryProps {
    format: FormatState;
    size: SizeState;
    activities: Activity[];
    hasActivityWithSuggestedActions: Activity;
    setMeasurements: (carouselMargin: number) => void;
    onClickRetry: (activity: Activity) => void;
    onClickCardAction: () => void;
    onSendPositiveFeedback: () => void;
    onSendNegativeFeedback: () => void;
    onMessageFailure: () => void;
    onReceiveMessage: () => void;
    isFromMe: (activity: Activity) => boolean;
    isSelected: (activity: Activity) => boolean;
    onClickActivity: (activity: Activity) => React.MouseEventHandler<HTMLDivElement>;
    onCardAction: () => void;
    doCardAction: IDoCardAction;
}
export declare class HistoryView extends React.Component<HistoryProps, {}> {
    private shellRef;
    private scrollMe;
    private scrollContent;
    private scrollToBottom;
    private carouselActivity;
    private largeWidth;
    constructor(props: HistoryProps);
    componentWillUpdate(nextProps: HistoryProps): void;
    componentDidUpdate(): void;
    private saveShellRef(shellWrapper);
    private autoscroll;
    private measurableCarousel;
    private doCardAction(type, value);
    changeHandler: () => void;
    render(): JSX.Element;
}
export declare const History: React.ComponentClass<any>;
export interface WrappedActivityProps {
    activity: Activity;
    showTimestamp: boolean;
    selected: boolean;
    fromMe: boolean;
    format: FormatState;
    onClickActivity: React.MouseEventHandler<HTMLDivElement>;
    onClickRetry: React.MouseEventHandler<HTMLAnchorElement>;
    onSendPositiveFeedback: any;
    onSendNegativeFeedback: any;
    onMessageFailure: any;
    onReceiveMessage: any;
    trackable?: boolean;
}
export declare class WrappedActivity extends React.Component<WrappedActivityProps, {}> {
    messageDiv: HTMLDivElement;
    constructor(props: WrappedActivityProps);
    private sendPositiveFeedback;
    private sendNegativeFeedback;
    private MessageFailure;
    render(): JSX.Element;
}
