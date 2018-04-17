"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var react_dom_1 = require("react-dom");
var botframework_directlinejs_1 = require("botframework-directlinejs");
var Store_1 = require("./Store");
var react_redux_1 = require("react-redux");
var SpeechModule_1 = require("./SpeechModule");
var konsole = require("./Konsole");
var getTabIndex_1 = require("./getTabIndex");
var ic_utility = require('./assets/ic_utility_header@1x.png');
var ic_close = require('./assets/ic_close@1x.png');
var ic_minimize = require('./assets/ic_minimize@1x.png');
var ic_chatbox = require('./assets/chatbox@1x.png');
var ic_frequent_questions_active = require('./assets/ic_frequents_questions_active@1x.png');
var ic_frequent_questions_inactive = require('./assets/ic_frequents_questions_inactive@1x.png');
var ic_videoChat = require('./assets/ic_videoChat@1x.png');
var History_1 = require("./History");
var MessagePane_1 = require("./MessagePane");
var Shell_1 = require("./Shell");
var FrequentActions_1 = require("./FrequentActions");
var InnerPanel_1 = require("./InnerPanel");
var api_1 = require("./api");
var Chat = (function (_super) {
    tslib_1.__extends(Chat, _super);
    function Chat(props) {
        var _this = _super.call(this, props) || this;
        _this.store = Store_1.createStore();
        _this.resizeListener = function () { return _this.setSize(); };
        _this._handleCardAction = _this.handleCardAction.bind(_this);
        _this._handleKeyDownCapture = _this.handleKeyDownCapture.bind(_this);
        _this._saveChatviewPanelRef = _this.saveChatviewPanelRef.bind(_this);
        _this._saveHistoryRef = _this.saveHistoryRef.bind(_this);
        _this._saveShellRef = _this.saveShellRef.bind(_this);
        _this.toggleChat = function () {
            _this.setState(function (prevState) { return ({
                showChat: !prevState.showChat
            }); });
        };
        _this.toggleFrequentActions = function () {
            _this.store.dispatch(Store_1.hideActionsPanel());
        };
        _this.toggleVideoChat = function () {
            _this.props.toggleVideoChat();
        };
        _this.resetChat = function () {
            _this.toggleChat();
            _this.store.dispatch(Store_1.resetActivities());
            _this.store.dispatch(Store_1.showActionsPanel());
        };
        konsole.log("BotChat.Chat props", props);
        _this.state = { showChat: _this.props.native };
        _this.store.dispatch({
            type: 'Set_Locale',
            locale: props.locale || window.navigator["userLanguage"] || window.navigator.language || 'en'
        });
        if (props.adaptiveCardsHostConfig) {
            _this.store.dispatch({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: props.adaptiveCardsHostConfig
            });
        }
        var chatTitle = props.chatTitle;
        if (props.formatOptions) {
            console.warn('DEPRECATED: "formatOptions.showHeader" is deprecated, use "chatTitle" instead. See https://github.com/Microsoft/BotFramework-WebChat/blob/master/CHANGELOG.md#formatoptionsshowheader-is-deprecated-use-chattitle-instead.');
            if (typeof props.formatOptions.showHeader !== 'undefined' && typeof props.chatTitle === 'undefined') {
                chatTitle = props.formatOptions.showHeader;
            }
        }
        if (typeof chatTitle !== 'undefined') {
            _this.store.dispatch({ type: 'Set_Chat_Title', chatTitle: chatTitle });
        }
        _this.store.dispatch({ type: 'Toggle_Upload_Button', showUploadButton: props.showUploadButton });
        if (props.sendTyping) {
            _this.store.dispatch({ type: 'Set_Send_Typing', sendTyping: props.sendTyping });
        }
        if (props.speechOptions) {
            SpeechModule_1.Speech.SpeechRecognizer.setSpeechRecognizer(props.speechOptions.speechRecognizer);
            SpeechModule_1.Speech.SpeechSynthesizer.setSpeechSynthesizer(props.speechOptions.speechSynthesizer);
        }
        api_1.getActions().then(function (response) {
            var actions = response.data.body;
            _this.store.dispatch(Store_1.setActions(actions.persistent_menu, actions.persistent_options));
        });
        return _this;
    }
    Chat.prototype.handleIncomingActivity = function (activity) {
        var state = this.store.getState();
        switch (activity.type) {
            case "message":
                if (activity.from.id !== state.connection.user.id)
                    this.store.dispatch({ type: 'Recv_Message' });
                this.store.dispatch({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity: activity });
                if (this.shellRef)
                    this.shellRef.focus();
                break;
            case "typing":
                if (activity.from.id !== state.connection.user.id)
                    this.store.dispatch({ type: 'Show_Typing', activity: activity });
                break;
        }
    };
    Chat.prototype.setSize = function () {
        this.store.dispatch({
            type: 'Set_Size',
            width: this.chatviewPanelRef.offsetWidth,
            height: this.chatviewPanelRef.offsetHeight
        });
    };
    Chat.prototype.showWelcomeMessage = function () {
        this.store.dispatch({
            type: 'Receive_Message',
            activity: {
                type: "message",
                from: {
                    id: 'bot'
                },
                text: "Hola soy un **asistente virtual**. ¿Cómo puedo ayudarte?",
                entities: [{ 'showMessage': true }],
                fromMe: false
            }
        });
    };
    Chat.prototype.handleCardAction = function () {
        // After the user click on any card action, we will "blur" the focus, by setting focus on message pane
        // This is for after click on card action, the user press "A", it should go into the chat box
        var historyDOM = react_dom_1.findDOMNode(this.historyRef);
        if (historyDOM) {
            historyDOM.focus();
        }
    };
    Chat.prototype.handleKeyDownCapture = function (evt) {
        var target = evt.target;
        var tabIndex = getTabIndex_1.getTabIndex(target);
        if (evt.altKey
            || evt.ctrlKey
            || evt.metaKey
            || (!inputtableKey(evt.key) && evt.key !== 'Backspace')) {
            // Ignore if one of the utility key (except SHIFT) is pressed
            // E.g. CTRL-C on a link in one of the message should not jump to chat box
            // E.g. "A" or "Backspace" should jump to chat box
            return;
        }
        if (target === react_dom_1.findDOMNode(this.historyRef)
            || typeof tabIndex !== 'number'
            || tabIndex < 0) {
            evt.stopPropagation();
            var key = void 0;
            // Quirks: onKeyDown we re-focus, but the newly focused element does not receive the subsequent onKeyPress event
            //         It is working in Chrome/Firefox/IE, confirmed not working in Edge/16
            //         So we are manually appending the key if they can be inputted in the box
            if (/(^|\s)Edge\/16\./.test(navigator.userAgent)) {
                key = inputtableKey(evt.key);
            }
            this.shellRef.focus(key);
        }
    };
    Chat.prototype.saveChatviewPanelRef = function (chatviewPanelRef) {
        this.chatviewPanelRef = chatviewPanelRef;
    };
    Chat.prototype.saveHistoryRef = function (historyWrapper) {
        this.historyRef = historyWrapper && historyWrapper.getWrappedInstance();
    };
    Chat.prototype.saveShellRef = function (shellWrapper) {
        if (shellWrapper) {
            this.shellRef = shellWrapper.getWrappedInstance();
        }
    };
    Chat.prototype.createConnectionWithToken = function () {
        var _this = this;
        return api_1.getToken().then((function (response) {
            _this.props.directLine.token = response.data.body.token;
            _this.createConnection();
        }));
    };
    Chat.prototype.createConnection = function () {
        var _this = this;
        var botConnection = this.props.directLine ?
            (this.botConnection = new botframework_directlinejs_1.DirectLine(this.props.directLine)) :
            this.props.botConnection;
        if (this.props.resize === 'window')
            window.addEventListener('resize', this.resizeListener);
        this.store.dispatch({ type: 'Start_Connection', user: this.props.user, bot: this.props.bot, botConnection: botConnection, selectedActivity: this.props.selectedActivity });
        this.connectionStatusSubscription = botConnection.connectionStatus$.subscribe(function (connectionStatus) {
            if (_this.props.speechOptions && _this.props.speechOptions.speechRecognizer) {
                var refGrammarId = botConnection.referenceGrammarId;
                if (refGrammarId)
                    _this.props.speechOptions.speechRecognizer.referenceGrammarId = refGrammarId;
            }
            _this.store.dispatch({ type: 'Connection_Change', connectionStatus: connectionStatus });
        });
        this.activitySubscription = botConnection.activity$.subscribe(function (activity) { return _this.handleIncomingActivity(activity); }, function (error) { return konsole.log("activity$ error", error); });
        if (this.props.selectedActivity) {
            this.selectedActivitySubscription = this.props.selectedActivity.subscribe(function (activityOrID) {
                _this.store.dispatch({
                    type: 'Select_Activity',
                    selectedActivity: activityOrID.activity || _this.store.getState().history.activities.find(function (activity) { return activity.id === activityOrID.id; })
                });
            });
        }
        this.showWelcomeMessage();
    };
    Chat.prototype.componentDidMount = function () {
        var _this = this;
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
        if (this.props.directLine && this.props.directLine.token === null) {
            this.createConnectionWithToken().then(function () {
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
                _this.botConnection.postActivity({
                    from: { id: 'me' },
                    name: 'updateUgoDataUser',
                    type: 'event',
                    value: {
                        ugoAccountId: _this.props.wdrgyAccount.id,
                        ugoAccountClientNumber: _this.props.wdrgyAccount.client_number,
                        ugoName: _this.props.wdrgyUser.first_name,
                        ugoLastname: _this.props.wdrgyUser.last_name,
                        ugoEmail: _this.props.wdrgyUser.email,
                        ugoToken: _this.props.wdrgySessionToken.sessionToken,
                        videoChatAvailable: true
                    }
                }).subscribe(function () {
                    console.log('"user data sent"');
                });
            });
        }
        else if (this.props.botConnection || this.props.directLine) {
            this.createConnection();
        }
    };
    Chat.prototype.componentWillUnmount = function () {
        if (this.connectionStatusSubscription)
            this.connectionStatusSubscription.unsubscribe();
        if (this.activitySubscription)
            this.activitySubscription.unsubscribe();
        if (this.selectedActivitySubscription)
            this.selectedActivitySubscription.unsubscribe();
        if (this.botConnection)
            this.botConnection.end();
        window.removeEventListener('resize', this.resizeListener);
    };
    Chat.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.props.adaptiveCardsHostConfig !== nextProps.adaptiveCardsHostConfig) {
            this.store.dispatch({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: nextProps.adaptiveCardsHostConfig
            });
        }
        if (this.props.showUploadButton !== nextProps.showUploadButton) {
            this.store.dispatch({
                type: 'Toggle_Upload_Button',
                showUploadButton: nextProps.showUploadButton
            });
        }
        if (this.props.chatTitle !== nextProps.chatTitle) {
            this.store.dispatch({
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
    };
    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (nothing needs to actually render here, so we don't)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity
    Chat.prototype.render = function () {
        var state = this.store.getState();
        konsole.log("BotChat.Chat state", state);
        // only render real stuff after we know our dimensions
        var header;
        //if (state.format.options.showHeader) {
        header = (React.createElement("div", { className: "wdrgy-wc-header-group" },
            React.createElement("div", { className: "wdrgy-wc-header" },
                React.createElement("div", { className: "wdrgy-brand" },
                    React.createElement("span", { className: "wdrgy-utilityco-brand" }, "Utility CO")),
                !this.props.native &&
                    React.createElement("div", { className: "wdrgy-icons" },
                        React.createElement("button", { type: "button", className: "wdrgy-close-button", onClick: this.toggleChat },
                            React.createElement("img", { className: "wdrgy-close wdrgy-minimize", src: ic_minimize, alt: "minimize" })),
                        React.createElement("button", { type: "button", className: "wdrgy-close-button", onClick: this.resetChat },
                            React.createElement("img", { className: "wdrgy-close", src: ic_close, alt: "close" })))),
            React.createElement("div", { className: "wdrgy-wc-button-bar" },
                React.createElement("div", { className: "wdrgy-icons" },
                    React.createElement("button", { type: "button", className: "wdrgy-close-button", onClick: this.toggleVideoChat },
                        React.createElement("img", { className: "wdrgy-close", src: ic_videoChat, alt: "video chat", title: "video chat" })),
                    React.createElement("button", { type: "button", className: "wdrgy-close-button", onClick: this.toggleFrequentActions },
                        React.createElement("img", { className: "wdrgy-close", src: ic_frequent_questions_active, alt: "preguntas frecuentes", title: "preguntas frecuentes" }))))));
        //}
        var resize;
        if (this.props.resize === 'detect')
            resize = React.createElement(ResizeDetector, { onresize: this.resizeListener });
        return (React.createElement(react_redux_1.Provider, { store: this.store },
            React.createElement("div", { className: "wdrgy-wc-chatview-panel " + (this.state.showChat ? "" : "chat-closed"), onKeyDownCapture: this._handleKeyDownCapture, ref: this._saveChatviewPanelRef },
                !this.state.showChat &&
                    React.createElement("button", { className: "wdrgy-launcher", onClick: this.toggleChat },
                        React.createElement("img", { src: ic_chatbox })),
                this.state.showChat &&
                    React.createElement("div", null,
                        header,
                        React.createElement(MessagePane_1.MessagePane, null,
                            React.createElement(History_1.History, { onCardAction: this._handleCardAction, ref: this._saveHistoryRef })),
                        React.createElement(InnerPanel_1.default, null),
                        React.createElement(Shell_1.Shell, { ref: this._saveShellRef }),
                        this.props.resize === 'detect' &&
                            React.createElement(ResizeDetector, { onresize: this.resizeListener }),
                        React.createElement(FrequentActions_1.default, null)))));
    };
    return Chat;
}(React.Component));
exports.Chat = Chat;
exports.doCardAction = function (botConnection, from, locale, sendMessage) { return function (type, actionValue) {
    var text = (typeof actionValue === 'string') ? actionValue : undefined;
    var value = (typeof actionValue === 'object') ? actionValue : undefined;
    switch (type) {
        case "imBack":
            if (typeof text === 'string')
                sendMessage(text, from, locale);
            break;
        case "postBack":
            exports.sendPostBack(botConnection, text, value, from, locale);
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
}; };
exports.sendPostBack = function (botConnection, text, value, from, locale) {
    botConnection.postActivity({
        type: "message",
        text: text,
        value: value,
        from: from,
        locale: locale
    })
        .subscribe(function (id) {
        konsole.log("success sending postBack", id);
    }, function (error) {
        konsole.log("failed to send postBack", error);
    });
};
exports.renderIfNonempty = function (value, renderer) {
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0))
        return renderer(value);
};
exports.classList = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.filter(Boolean).join(' ');
};
// note: container of this element must have CSS position of either absolute or relative
var ResizeDetector = function (props) {
    // adapted to React from https://github.com/developit/simple-element-resize-detector
    return React.createElement("iframe", { style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', margin: '1px 0 0', border: 'none', opacity: 0, visibility: 'hidden', pointerEvents: 'none' }, ref: function (frame) {
            if (frame)
                frame.contentWindow.onresize = props.onresize;
        } });
};
// For auto-focus in some browsers, we synthetically insert keys into the chatbox.
// By default, we insert keys when:
// 1. evt.key.length === 1 (e.g. "1", "A", "=" keys), or
// 2. evt.key is one of the map keys below (e.g. "Add" will insert "+", "Decimal" will insert ".")
var INPUTTABLE_KEY = {
    Add: '+',
    Decimal: '.',
    Divide: '/',
    Multiply: '*',
    Subtract: '-' // Numpad subtract key
};
function inputtableKey(key) {
    return key.length === 1 ? key : INPUTTABLE_KEY[key];
}
//# sourceMappingURL=Chat.js.map