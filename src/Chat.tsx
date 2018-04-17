import * as React from 'react';
import { findDOMNode } from 'react-dom';

import axios from 'axios';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Activity, IBotConnection, User, DirectLine, DirectLineOptions, CardActionTypes } from 'botframework-directlinejs';
import { createStore, ChatActions, sendMessage, resetActivities, showActionsPanel, setActions, hideActionsPanel } from './Store';
import { Provider } from 'react-redux';
import { SpeechOptions } from './SpeechOptions';
import { Speech } from './SpeechModule';
import { ActivityOrID, FormatOptions } from './Types';
import * as konsole from './Konsole';
import { getTabIndex } from './getTabIndex';


const ic_utility = require('./assets/ic_utility_header@1x.png');
const ic_close = require('./assets/ic_close@1x.png');
const ic_minimize = require('./assets/ic_minimize@1x.png');
const ic_chatbox = require('./assets/chatbox@1x.png');
const ic_frequent_questions_active = require('./assets/ic_frequents_questions_active@1x.png');
const ic_frequent_questions_inactive = require('./assets/ic_frequents_questions_inactive@1x.png');
const ic_videoChat = require('./assets/ic_videoChat@1x.png');

export interface WdrgyUser {
  id: number,
  first_name: string,
  last_name: string,
  email: string
}

export interface WdrgyAccount {
  id: number,
  client_number: string
}

export interface WdrgySessionToken {
  sessionToken: string
}

export interface ChatProps {
  adaptiveCardsHostConfig: any,
  chatTitle?: boolean | string,
  native?: boolean,
  user: User,
  bot: User,
  botConnection?: IBotConnection,
  directLine?: DirectLineOptions,
  speechOptions?: SpeechOptions,
  locale?: string,
  selectedActivity?: BehaviorSubject<ActivityOrID>,
  sendTyping?: boolean,
  showUploadButton?: boolean,
  formatOptions?: FormatOptions,
  resize?: 'none' | 'window' | 'detect',
  wdrgyUser: WdrgyUser,
  wdrgyAccount: WdrgyAccount,
  wdrgySessionToken: WdrgySessionToken,

  hideActionsPanel: () => void,
  toggleVideoChat: () => void
}

import { History } from './History';
import { MessagePane } from './MessagePane';
import { Shell, ShellFunctions } from './Shell';
import FrequentActionsPane from './FrequentActions';
import InnerPanel from './InnerPanel';
import { getActions, getToken } from './api';

export class Chat extends React.Component<ChatProps, { showChat: boolean }> {

  private store = createStore();

  private botConnection: IBotConnection;

  private activitySubscription: Subscription;
  private connectionStatusSubscription: Subscription;
  private selectedActivitySubscription: Subscription;
  private shellRef: React.Component & ShellFunctions;
  private historyRef: React.Component;
  private chatviewPanelRef: HTMLElement;

  private resizeListener = () => this.setSize();

  private _handleCardAction = this.handleCardAction.bind(this);
  private _handleKeyDownCapture = this.handleKeyDownCapture.bind(this);
  private _saveChatviewPanelRef = this.saveChatviewPanelRef.bind(this);
  private _saveHistoryRef = this.saveHistoryRef.bind(this);
  private _saveShellRef = this.saveShellRef.bind(this);

  constructor(props: ChatProps) {
    super(props);

    konsole.log("BotChat.Chat props", props);
    this.state ={ showChat: this.props.native };

    this.store.dispatch<ChatActions>({
      type: 'Set_Locale',
      locale: props.locale || (window.navigator as any)["userLanguage"] || window.navigator.language || 'en'
    });

        if (props.adaptiveCardsHostConfig) {
            this.store.dispatch<ChatActions>({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: props.adaptiveCardsHostConfig
            });
        }

        let { chatTitle } = props;

        if (props.formatOptions) {
            console.warn('DEPRECATED: "formatOptions.showHeader" is deprecated, use "chatTitle" instead. See https://github.com/Microsoft/BotFramework-WebChat/blob/master/CHANGELOG.md#formatoptionsshowheader-is-deprecated-use-chattitle-instead.');

            if (typeof props.formatOptions.showHeader !== 'undefined' && typeof props.chatTitle === 'undefined') {
                chatTitle = props.formatOptions.showHeader;
            }
        }

        if (typeof chatTitle !== 'undefined') {
            this.store.dispatch<ChatActions>({ type: 'Set_Chat_Title', chatTitle });
        }

        this.store.dispatch<ChatActions>({ type: 'Toggle_Upload_Button', showUploadButton: props.showUploadButton });

        if (props.sendTyping) {
      this.store.dispatch<ChatActions>({ type: 'Set_Send_Typing', sendTyping: props.sendTyping });
        }

    if (props.speechOptions) {
      Speech.SpeechRecognizer.setSpeechRecognizer(props.speechOptions.speechRecognizer);
      Speech.SpeechSynthesizer.setSpeechSynthesizer(props.speechOptions.speechSynthesizer);
    }

    getActions().then((response) => {
      const actions = response.data.body;
      this.store.dispatch(setActions(actions.persistent_menu, actions.persistent_options));
    });
  }

  private handleIncomingActivity(activity: Activity) {
    let state = this.store.getState();
    switch (activity.type) {
      case "message":
        if(activity.from.id !== state.connection.user.id)
          this.store.dispatch<ChatActions>({ type: 'Recv_Message' });

        this.store.dispatch<ChatActions>({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity });

        if(this.shellRef)
          this.shellRef.focus();
        break;

      case "typing":
        if (activity.from.id !== state.connection.user.id)
          this.store.dispatch<ChatActions>({ type: 'Show_Typing', activity });
        break;
    }
  }

  private setSize() {
    this.store.dispatch<ChatActions>({
      type: 'Set_Size',
            width: this.chatviewPanelRef.offsetWidth,
            height: this.chatviewPanelRef.offsetHeight
    });
  }

  private showWelcomeMessage() {
    this.store.dispatch<ChatActions>({
      type: 'Receive_Message',
      activity: {
        type: "message",
        from: {
          id: 'bot'
        },
        text: "Hola soy un **asistente virtual**. ¿Cómo puedo ayudarte?",
        entities: [{'showMessage': true}],
        fromMe: false
      }
    });
  }

    private handleCardAction() {
        // After the user click on any card action, we will "blur" the focus, by setting focus on message pane
        // This is for after click on card action, the user press "A", it should go into the chat box
        const historyDOM = findDOMNode(this.historyRef) as HTMLElement;

        if (historyDOM) {
            historyDOM.focus();
        }
    }

  private handleKeyDownCapture(evt: React.KeyboardEvent<HTMLDivElement>) {
    const target = evt.target as HTMLElement;
    const tabIndex = getTabIndex(target);

    if (
            evt.altKey
            || evt.ctrlKey
            || evt.metaKey
            || (!inputtableKey(evt.key) && evt.key !== 'Backspace')
        ) {
            // Ignore if one of the utility key (except SHIFT) is pressed
            // E.g. CTRL-C on a link in one of the message should not jump to chat box
            // E.g. "A" or "Backspace" should jump to chat box
            return;
        }

        if (
            target === findDOMNode(this.historyRef)
      || typeof tabIndex !== 'number'
      || tabIndex < 0
    ) {
      evt.stopPropagation();

      let key: string;

      // Quirks: onKeyDown we re-focus, but the newly focused element does not receive the subsequent onKeyPress event
      //         It is working in Chrome/Firefox/IE, confirmed not working in Edge/16
      //         So we are manually appending the key if they can be inputted in the box
      if (/(^|\s)Edge\/16\./.test(navigator.userAgent)) {
        key = inputtableKey(evt.key);
      }

      this.shellRef.focus(key);
    }
  }

  private saveChatviewPanelRef(chatviewPanelRef: HTMLElement) {
      this.chatviewPanelRef = chatviewPanelRef;
  }

  private saveHistoryRef(historyWrapper: any) {
      this.historyRef = historyWrapper && historyWrapper.getWrappedInstance();
  }

  private saveShellRef(shellWrapper: any) {
    if (shellWrapper) {
      this.shellRef = shellWrapper.getWrappedInstance();
    }
  }

  private toggleChat = () => {
    this.setState(prevState => ({
      showChat: !prevState.showChat
    }));
  }

  private toggleFrequentActions = () => {
    this.store.dispatch(hideActionsPanel());
  }

  private toggleVideoChat = () => {
    this.props.toggleVideoChat();
  }

  private resetChat = () => {
    this.toggleChat();
    this.store.dispatch(resetActivities());
    this.store.dispatch(showActionsPanel());
  }

  private createConnectionWithToken(){
    return getToken().then((response => {
      this.props.directLine.token = response.data.body.token;
      this.createConnection();
    }));
  }

  private createConnection(){
    const botConnection = this.props.directLine ?
          (this.botConnection = new DirectLine(this.props.directLine)) :
          this.props.botConnection;

    if (this.props.resize === 'window')
        window.addEventListener('resize', this.resizeListener);

    this.store.dispatch<ChatActions>({ type: 'Start_Connection', user: this.props.user, bot: this.props.bot, botConnection, selectedActivity: this.props.selectedActivity });

    this.connectionStatusSubscription = botConnection.connectionStatus$.subscribe(connectionStatus =>{
      if(this.props.speechOptions && this.props.speechOptions.speechRecognizer){
        let refGrammarId = botConnection.referenceGrammarId;
        if(refGrammarId)
          this.props.speechOptions.speechRecognizer.referenceGrammarId = refGrammarId;
      }
      this.store.dispatch<ChatActions>({ type: 'Connection_Change', connectionStatus })
    });

    this.activitySubscription = botConnection.activity$.subscribe(
      activity => this.handleIncomingActivity(activity),
      error => konsole.log("activity$ error", error)
    );

    if (this.props.selectedActivity) {
      this.selectedActivitySubscription = this.props.selectedActivity.subscribe(activityOrID => {
        this.store.dispatch<ChatActions>({
          type: 'Select_Activity',
          selectedActivity: activityOrID.activity || this.store.getState().history.activities.find(activity => activity.id === activityOrID.id)
        });
      });
    }

    this.showWelcomeMessage();
  }

  componentDidMount() {

    // Now that we're mounted, we know our dimensions. Put them in the store (this will force a re-render)
    this.setSize();

    /*
    // If exists secret proceed to get Token
    if(this.props.directLine && this.props.directLine.secret && this.props.directLine.token !== null){
      this.createConnection();
    } else {
      this.createConnectionWithToken();
    }
    */

    // If exists token proceed to get Token
    if(this.props.directLine && this.props.directLine.token === null){
      this.createConnectionWithToken().then(() => {
        /*this.botConnection.postActivity({
          from: { id: 'me' },
          name: 'updateUgoDataUser',
          type: 'event',
          value: {
            ugoToken: this.props.wdrgySessionToken.sessionToken,
            videoChatAvailable: true
          }
        }).subscribe((id) => {
          console.log('"token data sent"');
        });*/

        this.botConnection.postActivity({
          from: { id: 'me' },
          name: 'updateUgoDataUser',
          type: 'event',
          value: {
            ugoAccountId: this.props.wdrgyAccount.id,
            ugoAccountClientNumber: this.props.wdrgyAccount.client_number,
            ugoName: this.props.wdrgyUser.first_name,
            ugoLastname: this.props.wdrgyUser.last_name,
            ugoEmail: this.props.wdrgyUser.email,
            ugoToken: this.props.wdrgySessionToken.sessionToken,
            videoChatAvailable: true
          }
        }).subscribe(function () {
          console.log('"user data sent"');
        });
      });
   } else if(this.props.botConnection || this.props.directLine){
     this.createConnection();
   }
  }

  componentWillUnmount() {
    if (this.connectionStatusSubscription)
      this.connectionStatusSubscription.unsubscribe();
    if (this.activitySubscription)
      this.activitySubscription.unsubscribe();
    if (this.selectedActivitySubscription)
      this.selectedActivitySubscription.unsubscribe();
    if (this.botConnection)
      this.botConnection.end();
    window.removeEventListener('resize', this.resizeListener);
  }

  componentWillReceiveProps(nextProps: ChatProps) {
    if (this.props.adaptiveCardsHostConfig !== nextProps.adaptiveCardsHostConfig) {
      this.store.dispatch<ChatActions>({
        type: 'Set_AdaptiveCardsHostConfig',
        payload: nextProps.adaptiveCardsHostConfig
      });
    }

    if (this.props.showUploadButton !== nextProps.showUploadButton) {
      this.store.dispatch<ChatActions>({
        type: 'Toggle_Upload_Button',
        showUploadButton: nextProps.showUploadButton
      });
    }

    if (this.props.chatTitle !== nextProps.chatTitle) {
      this.store.dispatch<ChatActions>({
        type: 'Set_Chat_Title',
        chatTitle: nextProps.chatTitle
      });
    }

    if (this.props.wdrgyAccount && nextProps.wdrgyAccount &&
        this.props.wdrgyAccount.id !== nextProps.wdrgyAccount.id && this.botConnection) {
      this.botConnection.postActivity({
        from: { id: 'me' },
        name: 'updateUgoDataUser',
        type: 'event',
        value: {
          ugoAccountId: nextProps.wdrgyAccount.id,
          ugoAccountClientNumber: nextProps.wdrgyAccount.client_number
        }
      }).subscribe(function (id) {
        console.log('"account data sent"');
      });
    }
  }

  // At startup we do three render passes:
  // 1. To determine the dimensions of the chat panel (nothing needs to actually render here, so we don't)
  // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
  // 3. (this is also the normal re-render case) To render without the mock activity

  render() {
    const state = this.store.getState();
    konsole.log("BotChat.Chat state", state);

    // only render real stuff after we know our dimensions
    let header: JSX.Element;
    //if (state.format.options.showHeader) {
      header = (
        <div className="wdrgy-wc-header-group" >
          <div className="wdrgy-wc-header">
            <div className="wdrgy-brand">
                <span className="wdrgy-utilityco-brand">Utility CO</span>
            </div>
            {
              !this.props.native &&
              <div className="wdrgy-icons">
                <button type="button" className="wdrgy-close-button" onClick={this.toggleChat}>
                  <img className="wdrgy-close wdrgy-minimize" src={ic_minimize} alt="minimize" />
                </button>
                <button type="button" className="wdrgy-close-button" onClick={this.resetChat}>
                  <img className="wdrgy-close" src={ic_close} alt="close" />
                </button>
              </div>
            }
          </div>
          <div className="wdrgy-wc-button-bar">
            <div className="wdrgy-icons">
              <button type="button" className="wdrgy-close-button" onClick={this.toggleVideoChat}>
                <img className="wdrgy-close" src={ic_videoChat} alt="video chat" title="video chat" />
              </button>
              <button type="button" className="wdrgy-close-button" onClick={this.toggleFrequentActions}>
                <img className="wdrgy-close" src={ic_frequent_questions_active} alt="preguntas frecuentes" title="preguntas frecuentes" />
              </button>
            </div>
          </div>
        </div>
      );
    //}

    let resize: JSX.Element;
    if (this.props.resize === 'detect')
      resize = <ResizeDetector onresize={ this.resizeListener } />;

    return (
      <Provider store={ this.store }>
        <div
          className={`wdrgy-wc-chatview-panel ${ this.state.showChat ? "" : "chat-closed"}`}
          onKeyDownCapture={ this._handleKeyDownCapture }
                    ref={ this._saveChatviewPanelRef }
        >
          {
            !this.state.showChat &&
            <button className="wdrgy-launcher" onClick={this.toggleChat}>
              <img src={ic_chatbox} />
            </button>
          }
          {
            this.state.showChat &&
            <div>
              { header }
              <MessagePane>
                <History
                  onCardAction={ this._handleCardAction }
                  ref={ this._saveHistoryRef }
                />
              </MessagePane>
              <InnerPanel />
              <Shell ref={ this._saveShellRef } />
              {
              this.props.resize === 'detect' &&
              <ResizeDetector onresize={ this.resizeListener } />
              }
              <FrequentActionsPane />
            </div>
          }
        </div>
      </Provider>
    );
  }
}

export interface IDoCardAction {
  (type: CardActionTypes, value: string | object): void;
}

export const doCardAction = (
  botConnection: IBotConnection,
  from: User,
  locale: string,
    sendMessage: (value: string, user: User, locale: string) => void,
): IDoCardAction => (
  type,
  actionValue
) => {

  const text = (typeof actionValue === 'string') ? actionValue as string : undefined;
  const value = (typeof actionValue === 'object')? actionValue as object : undefined;

  switch (type) {
    case "imBack":
            if (typeof text === 'string')
        sendMessage(text, from, locale);
      break;

    case "postBack":
      sendPostBack(botConnection, text, value, from, locale);
      break;

    case "call":
    case "openUrl":
    case "playAudio":
    case "playVideo":
    case "showImage":
    case "downloadFile":
    case "signin":
      window.open(text);
      break;

    default:
      konsole.log("unknown button type", type);
    }
}

export const sendPostBack = (botConnection: IBotConnection, text: string, value: object, from: User, locale: string) => {
  botConnection.postActivity({
    type: "message",
    text,
    value,
    from,
    locale
  })
  .subscribe(id => {
    konsole.log("success sending postBack", id)
  }, error => {
    konsole.log("failed to send postBack", error);
  });
}

export const renderIfNonempty = (value: any, renderer: (value: any) => JSX.Element ) => {
  if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0))
    return renderer(value);
}

export const classList = (...args:(string | boolean)[]) => {
  return args.filter(Boolean).join(' ');
}

// note: container of this element must have CSS position of either absolute or relative
const ResizeDetector = (props: {
  onresize: () => void
}) =>
  // adapted to React from https://github.com/developit/simple-element-resize-detector
  <iframe
    style={ { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', margin: '1px 0 0', border: 'none', opacity: 0, visibility: 'hidden', pointerEvents: 'none' } }
    ref={ frame => {
      if (frame)
        frame.contentWindow.onresize = props.onresize;
    } }
  />;

// For auto-focus in some browsers, we synthetically insert keys into the chatbox.
// By default, we insert keys when:
// 1. evt.key.length === 1 (e.g. "1", "A", "=" keys), or
// 2. evt.key is one of the map keys below (e.g. "Add" will insert "+", "Decimal" will insert ".")
const INPUTTABLE_KEY: { [key: string]: string } = {
  Add: '+',      // Numpad add key
  Decimal: '.',  // Numpad decimal key
  Divide: '/',   // Numpad divide key
  Multiply: '*', // Numpad multiply key
  Subtract: '-'  // Numpad subtract key
};

function inputtableKey(key: string) {
  return key.length === 1 ? key : INPUTTABLE_KEY[key];
}
