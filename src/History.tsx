import * as React from 'react';
import { Activity, Message, User, CardActionTypes } from 'botframework-directlinejs';
import { ChatState, FormatState, SizeState } from './Store';
import { Dispatch, connect } from 'react-redux';
import { ActivityView } from './ActivityView';
import { classList, doCardAction, IDoCardAction } from './Chat';
import * as konsole from './Konsole';
import { sendMessage, ChatActions } from './Store';
import { activityWithSuggestedActions } from './activityWithSuggestedActions';
import { Shell, ShellFunctions } from './Shell';
import { giveFeedback } from './api';

const ic_avatar = require('./assets/ic_avatar@4x.png');
const ic_like = require('./assets/ic_like@2x.png');
const ic_dislike = require('./assets/ic_dislike@2x.png');

export interface HistoryProps {
  format: FormatState,
  size: SizeState,
  activities: Activity[],
  hasActivityWithSuggestedActions: Activity,

  setMeasurements: (carouselMargin: number) => void,
  onClickRetry: (activity: Activity) => void,
  onClickCardAction: () => void,
  onSendPositiveFeedback: () => void,
  onSendNegativeFeedback: () => void,
  onMessageFailure: () => void,
  onReceiveMessage: () => void,
  isFromMe: (activity: Activity) => boolean,
  isSelected: (activity: Activity) => boolean,
  onClickActivity: (activity: Activity) => React.MouseEventHandler<HTMLDivElement>,

  onCardAction: () => void,
  doCardAction: IDoCardAction
}

export class HistoryView extends React.Component<HistoryProps, {}> {

  private shellRef: React.Component & ShellFunctions;
  private scrollMe: HTMLDivElement;
  private scrollContent: HTMLDivElement;
  private scrollToBottom = true;

  private carouselActivity: WrappedActivity;
  private largeWidth: number;

  constructor(props: HistoryProps) {
    super(props);
    document.addEventListener("fullscreenchange", this.changeHandler, false);
    document.addEventListener("webkitfullscreenchange", this.changeHandler, false);
    document.addEventListener("mozfullscreenchange", this.changeHandler, false);
  }

  componentWillUpdate(nextProps: HistoryProps) {
    //this.autoscroll();
    let scrollToBottomDetectionTolerance = 1;

    if (!this.props.hasActivityWithSuggestedActions && nextProps.hasActivityWithSuggestedActions) {
      scrollToBottomDetectionTolerance = 40; // this should be in-sync with $actionsHeight scss var
    }

    this.scrollToBottom = (Math.abs(this.scrollMe.scrollHeight - this.scrollMe.scrollTop - this.scrollMe.offsetHeight) <= scrollToBottomDetectionTolerance);
  }

  componentDidUpdate() {
    if (this.props.format.carouselMargin == undefined) {
      // After our initial render we need to measure the carousel width

      // Measure the message padding by subtracting the known large width
      const paddedWidth = measurePaddedWidth(this.carouselActivity.messageDiv) - this.largeWidth;

      // Subtract the padding from the offsetParent's width to get the width of the content
      const maxContentWidth = (this.carouselActivity.messageDiv.offsetParent as HTMLElement).offsetWidth - paddedWidth;

      // Subtract the content width from the chat width to get the margin.
      // Next time we need to get the content width (on a resize) we can use this margin to get the maximum content width
      const carouselMargin = this.props.size.width - maxContentWidth;

      konsole.log('history measureMessage ' + carouselMargin);

      // Finally, save it away in the Store, which will force another re-render
      this.props.setMeasurements(carouselMargin)

      this.carouselActivity = null; // After the re-render this activity doesn't exist
    }

    this.autoscroll();
  }

  private saveShellRef(shellWrapper: any) {
    if (shellWrapper) {
      this.shellRef = shellWrapper.getWrappedInstance();
    }
  }

  private autoscroll = () => {
    const vAlignBottomPadding = Math.max(0, measurePaddedHeight(this.scrollMe) - this.scrollContent.offsetHeight);
    this.scrollContent.style.marginTop = vAlignBottomPadding + 'px';

    const lastActivity = this.props.activities[this.props.activities.length - 1];
    const lastActivityFromMe = lastActivity && this.props.isFromMe && this.props.isFromMe(lastActivity);

    // Validating if we are at the bottom of the list or the last activity was triggered by the user.
    if (this.scrollToBottom || lastActivityFromMe) {
      this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    }
  }

  // In order to do their cool horizontal scrolling thing, Carousels need to know how wide they can be.
  // So, at startup, we create this mock Carousel activity and measure it.
  private measurableCarousel = () =>
    // find the largest possible message size by forcing a width larger than the chat itself
    <WrappedActivity
      ref={ x => this.carouselActivity = x }
      activity={ {
        type: 'message',
        id: '',
        from: { id: '' },
        attachmentLayout: 'carousel'
      } }
      format={ null }
      fromMe={ false }
      onClickActivity={ null }
      onClickRetry={ null }
      onSendPositiveFeedback={ null }
      onSendNegativeFeedback={ null }
      onMessageFailure={ null }
      onReceiveMessage={ null }
      selected={ false }
      showTimestamp={ false }
    >
      <div style={ { width: this.largeWidth } }>&nbsp;</div>
    </WrappedActivity>;




  // At startup we do three render passes:
  // 1. To determine the dimensions of the chat panel (not much needs to actually render here)
  // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
  // 3. (this is also the normal re-render case) To render without the mock activity

  private doCardAction(type: CardActionTypes, value: string | object) {
    this.props.onClickCardAction();
    return this.props.doCardAction(type, value);
  }

  changeHandler = () => {
    this.autoscroll();
  }

  render() {
    konsole.log("History props", this);
    let content;
    let showContentProps = false;
    let contentProps;

    if (this.props.size.width !== undefined) {
      if (this.props.format.carouselMargin === undefined) {
        // For measuring carousels we need a width known to be larger than the chat itself
        this.largeWidth = this.props.size.width * 2;
        content = <this.measurableCarousel/>;

        if( this.props.activities && this.props.activities.length > 0){
          showContentProps = true;
          contentProps = this.props.activities.map((activity, index) =>
            <WrappedActivity
              format={ this.props.format }
              key={ 'message' + index }
              activity={ activity }
              showTimestamp={ index === this.props.activities.length - 1 || (index + 1 < this.props.activities.length && suitableInterval(activity, this.props.activities[index + 1])) }
              selected={ this.props.isSelected(activity) }
              fromMe={ this.props.isFromMe(activity) }
              onClickActivity={ this.props.onClickActivity(activity) }
              onSendPositiveFeedback={ this.props.onSendPositiveFeedback() }
              onSendNegativeFeedback={ this.props.onSendNegativeFeedback() }
              onMessageFailure={ this.props.onMessageFailure() }
              onReceiveMessage={ this.props.onReceiveMessage() }
              onClickRetry={ e => {
                // Since this is a click on an anchor, we need to stop it
                // from trying to actually follow a (nonexistant) link
                e.preventDefault();
                e.stopPropagation();
                this.props.onClickRetry(activity)
              } }
            >
              <ActivityView
                format={ this.props.format }
                size={ this.props.size }
                activity={ activity }
                onCardAction={ (type: CardActionTypes, value: string | object) => this.doCardAction(type, value) }
                onImageLoad={ () => this.autoscroll() }
              />
            </WrappedActivity>
          );
        }

      } else {
        showContentProps = false;
        content = this.props.activities.map((activity, index) =>
          (activity.type !== 'message' || activity.text || (activity.attachments && activity.attachments.length)) &&
              <WrappedActivity
                format={ this.props.format }
                key={ 'message' + index }
                activity={ activity }
                showTimestamp={ index === this.props.activities.length - 1 || (index + 1 < this.props.activities.length && suitableInterval(activity, this.props.activities[index + 1])) }
                selected={ this.props.isSelected(activity) }
                fromMe={ this.props.isFromMe(activity) }
                onClickActivity={ this.props.onClickActivity(activity) }
                onSendPositiveFeedback={ this.props.onSendPositiveFeedback() }
                onSendNegativeFeedback={ this.props.onSendNegativeFeedback() }
                onMessageFailure={ this.props.onMessageFailure() }
                onReceiveMessage={ this.props.onReceiveMessage() }
                onClickRetry={ e => {
                  // Since this is a click on an anchor, we need to stop it
                  // from trying to actually follow a (nonexistant) link
                  e.preventDefault();
                  e.stopPropagation();
                  this.props.onClickRetry(activity)
                } }
              >
                <ActivityView
                  format={ this.props.format }
                  size={ this.props.size }
                  activity={ activity }
                  onCardAction={ (type: CardActionTypes, value: string | object) => this.doCardAction(type, value) }
                  onImageLoad={ () => this.autoscroll() }
                />
              </WrappedActivity>
        );
      }
    }

        const groupsClassName = classList('wdrgy-wc-message-groups', !this.props.format.chatTitle && 'no-header');

    return (
            <div
                className={ groupsClassName }
                ref={ div => this.scrollMe = div || this.scrollMe }
                role="log"
                tabIndex={ 0 }
            >
        <div className="wdrgy-wc-message-group-content" ref={ div => { if (div) this.scrollContent = div }}>
          { content }
          { showContentProps &&
            contentProps
          }
        </div>
      </div>
    );
  }
}

export const History = connect(
  (state: ChatState) => ({
    // passed down to HistoryView
    format: state.format,
    size: state.size,
    activities: state.history.activities,
    hasActivityWithSuggestedActions: !!activityWithSuggestedActions(state.history.activities),
    // only used to create helper functions below
    connectionSelectedActivity: state.connection.selectedActivity,
    selectedActivity: state.history.selectedActivity,
    botConnection: state.connection.botConnection,
    user: state.connection.user
  }), {
    setMeasurements: (carouselMargin: number) => ({ type: 'Set_Measurements', carouselMargin }),
    onClickRetry: (activity: Activity) => ({ type: 'Send_Message_Retry', clientActivityId: activity.channelData.clientActivityId }),
    onClickCardAction: () => ({ type: 'Card_Action_Clicked'}),
    onSendPositiveFeedback: () => ({
      type: 'Feedback_Response',
      activity: {
        type: "message",
        from: {
          id: 'bot'
        },
        text: '¡ Muchas gracias !',
        entities: [{'showMessage': true}]}}),
    onSendNegativeFeedback: () => ({
      type: 'Feedback_Response',
      activity: {
        type: "message",
        from: {
          id: 'bot'
        },
        text: '¡ Muchas gracias !',
        entities: [{'showMessage': true}]}}),
    onMessageFailure: () =>({
      type : 'Message_Failure',
      activity: {
        type: "message",
        from: {
          id: 'bot'
        },
        text: 'Oops parece que tenemos problemas con la conexión.\n\nPor favor recarga la página e inicia nuevamente la conversación.',
        entities: [{'showMessage': true}]}}),
    onReceiveMessage: () =>({ type: 'Recv_Message' }),
    // only used to create helper functions below
    sendMessage
  }, (stateProps: any, dispatchProps: any, ownProps: any): HistoryProps => ({
    // from stateProps
    format: stateProps.format,
    size: stateProps.size,
    activities: stateProps.activities,
    hasActivityWithSuggestedActions: stateProps.hasActivityWithSuggestedActions,
    // from dispatchProps
    setMeasurements: dispatchProps.setMeasurements,
    onClickRetry: dispatchProps.onClickRetry,
    onClickCardAction: dispatchProps.onClickCardAction,
    onSendPositiveFeedback: () => dispatchProps.onSendPositiveFeedback,
    onSendNegativeFeedback: () => dispatchProps.onSendNegativeFeedback,
    onMessageFailure: () => dispatchProps.onMessageFailure,
    onReceiveMessage: () => dispatchProps.onReceiveMessage,
    // helper functions
    doCardAction: doCardAction(stateProps.botConnection, stateProps.user, stateProps.format.locale, dispatchProps.sendMessage),
    isFromMe: (activity: Activity) => activity.from.id === stateProps.user.id,
    isSelected: (activity: Activity) => activity === stateProps.selectedActivity,
        onClickActivity: (activity: Activity) => stateProps.connectionSelectedActivity && (() => stateProps.connectionSelectedActivity.next({ activity })),
        onCardAction: ownProps.onCardAction
    }), {
        withRef: true
    }
)(HistoryView);

const getComputedStyleValues = (el: HTMLElement, stylePropertyNames: string[]) => {
  const s = window.getComputedStyle(el);
  const result: { [key: string]: number } = {};
  stylePropertyNames.forEach(name => result[name] = parseInt(s.getPropertyValue(name)));
  return result;
}

const measurePaddedHeight = (el: HTMLElement): number => {
  const paddingTop = 'padding-top', paddingBottom = 'padding-bottom';
  const values = getComputedStyleValues(el, [paddingTop, paddingBottom]);
  return el.offsetHeight - values[paddingTop] - values[paddingBottom];
}

const measurePaddedWidth = (el: HTMLElement): number => {
  const paddingLeft = 'padding-left', paddingRight = 'padding-right';
  const values = getComputedStyleValues(el, [paddingLeft, paddingRight]);
  return el.offsetWidth + values[paddingLeft] + values[paddingRight];
}

const suitableInterval = (current: Activity, next: Activity) =>
  Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;



//------------------------------------------------------------------------------
//-- WrappedActivity class
//------------------------------------------------------------------------------
export interface WrappedActivityProps {
  activity: Activity,
  showTimestamp: boolean,
  selected: boolean,
  fromMe: boolean,
  format: FormatState,
  onClickActivity: React.MouseEventHandler<HTMLDivElement>,
  onClickRetry: React.MouseEventHandler<HTMLAnchorElement>,
  onSendPositiveFeedback: any,
  onSendNegativeFeedback: any,
  onMessageFailure: any,
  onReceiveMessage: any,
  trackable?: boolean
}

export class WrappedActivity extends React.Component<WrappedActivityProps, {}> {
  public messageDiv: HTMLDivElement;

  constructor(props: WrappedActivityProps) {
    super(props);
  }

  private sendPositiveFeedback = () => {

    var uid = null;
    var action = null;
    var question = null;

    // dispatch action
    this.props.onSendPositiveFeedback();

    // changing visibility to avatar client message
    if ( this.props.activity.type === 'message' &&
         this.props.activity.entities &&
         this.props.activity.entities.length > 0){

      if( this.props.activity.entities[0].showMessage )
        this.props.activity.entities[0].showMessage = false;

      if( this.props.activity.entities[0].trackable )
        this.props.activity.entities[0].trackable = false;

      if( this.props.activity.entities[0].uid )
          uid = this.props.activity.entities[0].uid;

      if( this.props.activity.entities[0].action )
          action = this.props.activity.entities[0].action;

      if( this.props.activity.entities[0].action )
          question = this.props.activity.entities[0].question;
    }

    // sending to api the feedback action to api
    var response = giveFeedback({
                          id: this.props.activity.id,
                          type: 'like',
                          uid: uid,
                          action: action,
                          question: question
                        });

    konsole.log('response giveFeedback like', response);
  };

  private sendNegativeFeedback = () => {

    var uid = null;
    var action = null;
    var question = null;

    // dispatch action
    this.props.onSendNegativeFeedback();
    // changing visibility to avatar client message
    if ( this.props.activity.type === 'message' &&
         this.props.activity.entities &&
         this.props.activity.entities.length > 0){

      if( this.props.activity.entities[0].showMessage )
        this.props.activity.entities[0].showMessage = false;

      if( this.props.activity.entities[0].trackable )
        this.props.activity.entities[0].trackable = false;

      if( this.props.activity.entities[0].uid )
          uid = this.props.activity.entities[0].uid;

      if( this.props.activity.entities[0].action )
          action = this.props.activity.entities[0].action;

      if( this.props.activity.entities[0].action )
          question = this.props.activity.entities[0].question;
    }

    // sending to api the feedback action to api
    var response = giveFeedback({
                          id: this.props.activity.id,
                          type: 'dislike',
                          uid: uid,
                          action: action,
                          question: question
                        });

    konsole.log('response giveFeedback dislike', response);
  };

  private MessageFailure = () => {
    // dispatch action
    this.props.onMessageFailure();
    this.props.onReceiveMessage();
    this.props.activity.id = "";
  }

  render () {
    let timeLine: JSX.Element;

    const who = this.props.fromMe ? 'me' : ( this.props.activity.id != '' ? ( this.props.activity.type === 'typing' ? 'typing' : 'bot') : 'init' );
    const isEntityTrackable = !this.props.fromMe && (this.props.activity.type === 'message' && this.props.activity.entities && this.props.activity.entities[0].trackable);
    const flagShowBotMessage = (this.props.activity.type === 'message') ?
            ((this.props.activity.inputHint === 'welcome') ||
             (this.props.activity.entities && this.props.activity.entities[0].showMessage)) : false;
    const videoIframe = (this.props.activity.type === 'message' && this.props.activity.entities && this.props.activity.entities[0].videoIframe);
    const videoUri = (this.props.activity.type === 'message' && this.props.activity.entities && this.props.activity.entities[0].videoUri);

    switch (this.props.activity.id) {
      case undefined:
        timeLine = <span>{ this.props.format.strings.messageSending }</span>;
        break;
      case null:
        timeLine = <span>{ this.props.format.strings.messageFailed }</span>;
        this.MessageFailure();
        break;
      case "retry":
        timeLine =
          <span>
            { this.props.format.strings.messageFailed }
            { ' ' }
            <a href="." onClick={ this.props.onClickRetry }>{ this.props.format.strings.messageRetry }</a>
          </span>;
        this.MessageFailure();
        break;
      default:
        let sent: string;
        if (this.props.showTimestamp)
          sent = this.props.format.strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
        timeLine = <span>{ this.props.activity.from.name || this.props.activity.from.id }{ sent }</span>;
        timeLine = <span>{ sent }</span>;
        break;
    }

    let wrapperClassName
    if( this.props.fromMe ){
      wrapperClassName = classList(
        'wdrgy-wc-message-wrapper-me',
        (this.props.activity as Message).attachmentLayout || 'list',
        this.props.onClickActivity && 'clickable'
      );
    } else {
      wrapperClassName = classList(
        'wdrgy-wc-message-wrapper',
        (this.props.activity as Message).attachmentLayout || 'list',
        this.props.onClickActivity && 'clickable'
      );
    }

    const contentClassName = classList(
      'wdrgy-wc-message-content',
      this.props.selected && 'selected'
    );

    //formatting dynamic style for bot icon
    let avatarClassName = 'wdrgy-avatar';
    if ( !flagShowBotMessage )
      avatarClassName += '-hidden';

    return (
        <div data-activity-id={ this.props.activity.id } className={ wrapperClassName } onClick={ this.props.onClickActivity } >
          <div className={ 'wdrgy-wc-message wdrgy-wc-message-from-' + who } ref={ div => this.messageDiv = div }>
            {
              who === 'bot' &&
              <img className={avatarClassName} src={ic_avatar} alt="avatar" />
            }
            <div className={ contentClassName }>
              {
                ((who === 'bot' || who === 'me' ) && !videoIframe )  &&
                  this.props.children
              }
              {
                (who === 'bot' && videoIframe)  &&
                <div>
                  <div className="wc-list">
                    <div className="wc-card wc-adaptive-card video">
                      <div className="non-adaptive-content">
                        <iframe allowFullScreen src={videoUri} />
                      </div>
                    </div>
                  </div>
                </div>
              }
              {
                who === 'typing' &&
                  <div className="wdrgy-wc-typing"/>
              }
            </div>
          </div >
          <div className={'wdrgy-wc-message-bottom-' + who}>
          {
            who === 'me'  &&
            <div className="wdrgy-triangle-topright"></div>
          }
          {
            who === 'bot' && !videoIframe && flagShowBotMessage &&
            <div className="wdrgy-triangle-topleft"></div>
          }
          {
            isEntityTrackable &&
            <div className={ 'wdrgy-wc-message-from-feedback' }>
              <div className="wdrgy-feedback">
                <span className="wdrgy-wc-message-from wdrgy-wc-message-from-feedback">¿Resolví tu consulta?</span>
              </div>
              <div className="wdrgy-feedback">
                <button className="wdrgy-feedback-button" onClick={this.sendPositiveFeedback}>
                  <img src={ic_like} className="wdrgy-feedback-icon" alt="like" />
                </button>
              </div>
              <div className="wdrgy-feedback">
                <button className="wdrgy-feedback-button" onClick={this.sendNegativeFeedback}>
                  <img src={ic_dislike} className="wdrgy-feedback-icon" alt="dislike" />
                </button>
              </div>
            </div>
        }
        </div>
      </div>
    );
}


}
