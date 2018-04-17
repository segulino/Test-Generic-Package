"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var react_redux_1 = require("react-redux");
var ActivityView_1 = require("./ActivityView");
var Chat_1 = require("./Chat");
var konsole = require("./Konsole");
var Store_1 = require("./Store");
var activityWithSuggestedActions_1 = require("./activityWithSuggestedActions");
var api_1 = require("./api");
var ic_avatar = require('./assets/ic_avatar@4x.png');
var ic_like = require('./assets/ic_like@2x.png');
var ic_dislike = require('./assets/ic_dislike@2x.png');
var HistoryView = (function (_super) {
    tslib_1.__extends(HistoryView, _super);
    function HistoryView(props) {
        var _this = _super.call(this, props) || this;
        _this.scrollToBottom = true;
        _this.autoscroll = function () {
            var vAlignBottomPadding = Math.max(0, measurePaddedHeight(_this.scrollMe) - _this.scrollContent.offsetHeight);
            _this.scrollContent.style.marginTop = vAlignBottomPadding + 'px';
            var lastActivity = _this.props.activities[_this.props.activities.length - 1];
            var lastActivityFromMe = lastActivity && _this.props.isFromMe && _this.props.isFromMe(lastActivity);
            // Validating if we are at the bottom of the list or the last activity was triggered by the user.
            if (_this.scrollToBottom || lastActivityFromMe) {
                _this.scrollMe.scrollTop = _this.scrollMe.scrollHeight - _this.scrollMe.offsetHeight;
            }
        };
        // In order to do their cool horizontal scrolling thing, Carousels need to know how wide they can be.
        // So, at startup, we create this mock Carousel activity and measure it.
        _this.measurableCarousel = function () {
            // find the largest possible message size by forcing a width larger than the chat itself
            return React.createElement(WrappedActivity, { ref: function (x) { return _this.carouselActivity = x; }, activity: {
                    type: 'message',
                    id: '',
                    from: { id: '' },
                    attachmentLayout: 'carousel'
                }, format: null, fromMe: false, onClickActivity: null, onClickRetry: null, onSendPositiveFeedback: null, onSendNegativeFeedback: null, onMessageFailure: null, onReceiveMessage: null, selected: false, showTimestamp: false },
                React.createElement("div", { style: { width: _this.largeWidth } }, "\u00A0"));
        };
        _this.changeHandler = function () {
            _this.autoscroll();
        };
        document.addEventListener("fullscreenchange", _this.changeHandler, false);
        document.addEventListener("webkitfullscreenchange", _this.changeHandler, false);
        document.addEventListener("mozfullscreenchange", _this.changeHandler, false);
        return _this;
    }
    HistoryView.prototype.componentWillUpdate = function (nextProps) {
        //this.autoscroll();
        var scrollToBottomDetectionTolerance = 1;
        if (!this.props.hasActivityWithSuggestedActions && nextProps.hasActivityWithSuggestedActions) {
            scrollToBottomDetectionTolerance = 40; // this should be in-sync with $actionsHeight scss var
        }
        this.scrollToBottom = (Math.abs(this.scrollMe.scrollHeight - this.scrollMe.scrollTop - this.scrollMe.offsetHeight) <= scrollToBottomDetectionTolerance);
    };
    HistoryView.prototype.componentDidUpdate = function () {
        if (this.props.format.carouselMargin == undefined) {
            // After our initial render we need to measure the carousel width
            // Measure the message padding by subtracting the known large width
            var paddedWidth = measurePaddedWidth(this.carouselActivity.messageDiv) - this.largeWidth;
            // Subtract the padding from the offsetParent's width to get the width of the content
            var maxContentWidth = this.carouselActivity.messageDiv.offsetParent.offsetWidth - paddedWidth;
            // Subtract the content width from the chat width to get the margin.
            // Next time we need to get the content width (on a resize) we can use this margin to get the maximum content width
            var carouselMargin = this.props.size.width - maxContentWidth;
            konsole.log('history measureMessage ' + carouselMargin);
            // Finally, save it away in the Store, which will force another re-render
            this.props.setMeasurements(carouselMargin);
            this.carouselActivity = null; // After the re-render this activity doesn't exist
        }
        this.autoscroll();
    };
    HistoryView.prototype.saveShellRef = function (shellWrapper) {
        if (shellWrapper) {
            this.shellRef = shellWrapper.getWrappedInstance();
        }
    };
    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (not much needs to actually render here)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity
    HistoryView.prototype.doCardAction = function (type, value) {
        this.props.onClickCardAction();
        return this.props.doCardAction(type, value);
    };
    HistoryView.prototype.render = function () {
        var _this = this;
        konsole.log("History props", this);
        var content;
        var showContentProps = false;
        var contentProps;
        if (this.props.size.width !== undefined) {
            if (this.props.format.carouselMargin === undefined) {
                // For measuring carousels we need a width known to be larger than the chat itself
                this.largeWidth = this.props.size.width * 2;
                content = React.createElement(this.measurableCarousel, null);
                if (this.props.activities && this.props.activities.length > 0) {
                    showContentProps = true;
                    contentProps = this.props.activities.map(function (activity, index) {
                        return React.createElement(WrappedActivity, { format: _this.props.format, key: 'message' + index, activity: activity, showTimestamp: index === _this.props.activities.length - 1 || (index + 1 < _this.props.activities.length && suitableInterval(activity, _this.props.activities[index + 1])), selected: _this.props.isSelected(activity), fromMe: _this.props.isFromMe(activity), onClickActivity: _this.props.onClickActivity(activity), onSendPositiveFeedback: _this.props.onSendPositiveFeedback(), onSendNegativeFeedback: _this.props.onSendNegativeFeedback(), onMessageFailure: _this.props.onMessageFailure(), onReceiveMessage: _this.props.onReceiveMessage(), onClickRetry: function (e) {
                                // Since this is a click on an anchor, we need to stop it
                                // from trying to actually follow a (nonexistant) link
                                e.preventDefault();
                                e.stopPropagation();
                                _this.props.onClickRetry(activity);
                            } },
                            React.createElement(ActivityView_1.ActivityView, { format: _this.props.format, size: _this.props.size, activity: activity, onCardAction: function (type, value) { return _this.doCardAction(type, value); }, onImageLoad: function () { return _this.autoscroll(); } }));
                    });
                }
            }
            else {
                showContentProps = false;
                content = this.props.activities.map(function (activity, index) {
                    return (activity.type !== 'message' || activity.text || (activity.attachments && activity.attachments.length)) &&
                        React.createElement(WrappedActivity, { format: _this.props.format, key: 'message' + index, activity: activity, showTimestamp: index === _this.props.activities.length - 1 || (index + 1 < _this.props.activities.length && suitableInterval(activity, _this.props.activities[index + 1])), selected: _this.props.isSelected(activity), fromMe: _this.props.isFromMe(activity), onClickActivity: _this.props.onClickActivity(activity), onSendPositiveFeedback: _this.props.onSendPositiveFeedback(), onSendNegativeFeedback: _this.props.onSendNegativeFeedback(), onMessageFailure: _this.props.onMessageFailure(), onReceiveMessage: _this.props.onReceiveMessage(), onClickRetry: function (e) {
                                // Since this is a click on an anchor, we need to stop it
                                // from trying to actually follow a (nonexistant) link
                                e.preventDefault();
                                e.stopPropagation();
                                _this.props.onClickRetry(activity);
                            } },
                            React.createElement(ActivityView_1.ActivityView, { format: _this.props.format, size: _this.props.size, activity: activity, onCardAction: function (type, value) { return _this.doCardAction(type, value); }, onImageLoad: function () { return _this.autoscroll(); } }));
                });
            }
        }
        var groupsClassName = Chat_1.classList('wdrgy-wc-message-groups', !this.props.format.chatTitle && 'no-header');
        return (React.createElement("div", { className: groupsClassName, ref: function (div) { return _this.scrollMe = div || _this.scrollMe; }, role: "log", tabIndex: 0 },
            React.createElement("div", { className: "wdrgy-wc-message-group-content", ref: function (div) { if (div)
                    _this.scrollContent = div; } },
                content,
                showContentProps &&
                    contentProps)));
    };
    return HistoryView;
}(React.Component));
exports.HistoryView = HistoryView;
exports.History = react_redux_1.connect(function (state) { return ({
    // passed down to HistoryView
    format: state.format,
    size: state.size,
    activities: state.history.activities,
    hasActivityWithSuggestedActions: !!activityWithSuggestedActions_1.activityWithSuggestedActions(state.history.activities),
    // only used to create helper functions below
    connectionSelectedActivity: state.connection.selectedActivity,
    selectedActivity: state.history.selectedActivity,
    botConnection: state.connection.botConnection,
    user: state.connection.user
}); }, {
    setMeasurements: function (carouselMargin) { return ({ type: 'Set_Measurements', carouselMargin: carouselMargin }); },
    onClickRetry: function (activity) { return ({ type: 'Send_Message_Retry', clientActivityId: activity.channelData.clientActivityId }); },
    onClickCardAction: function () { return ({ type: 'Card_Action_Clicked' }); },
    onSendPositiveFeedback: function () { return ({
        type: 'Feedback_Response',
        activity: {
            type: "message",
            from: {
                id: 'bot'
            },
            text: '¡ Muchas gracias !',
            entities: [{ 'showMessage': true }]
        }
    }); },
    onSendNegativeFeedback: function () { return ({
        type: 'Feedback_Response',
        activity: {
            type: "message",
            from: {
                id: 'bot'
            },
            text: '¡ Muchas gracias !',
            entities: [{ 'showMessage': true }]
        }
    }); },
    onMessageFailure: function () { return ({
        type: 'Message_Failure',
        activity: {
            type: "message",
            from: {
                id: 'bot'
            },
            text: 'Oops parece que tenemos problemas con la conexión.\n\nPor favor recarga la página e inicia nuevamente la conversación.',
            entities: [{ 'showMessage': true }]
        }
    }); },
    onReceiveMessage: function () { return ({ type: 'Recv_Message' }); },
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage
}, function (stateProps, dispatchProps, ownProps) { return ({
    // from stateProps
    format: stateProps.format,
    size: stateProps.size,
    activities: stateProps.activities,
    hasActivityWithSuggestedActions: stateProps.hasActivityWithSuggestedActions,
    // from dispatchProps
    setMeasurements: dispatchProps.setMeasurements,
    onClickRetry: dispatchProps.onClickRetry,
    onClickCardAction: dispatchProps.onClickCardAction,
    onSendPositiveFeedback: function () { return dispatchProps.onSendPositiveFeedback; },
    onSendNegativeFeedback: function () { return dispatchProps.onSendNegativeFeedback; },
    onMessageFailure: function () { return dispatchProps.onMessageFailure; },
    onReceiveMessage: function () { return dispatchProps.onReceiveMessage; },
    // helper functions
    doCardAction: Chat_1.doCardAction(stateProps.botConnection, stateProps.user, stateProps.format.locale, dispatchProps.sendMessage),
    isFromMe: function (activity) { return activity.from.id === stateProps.user.id; },
    isSelected: function (activity) { return activity === stateProps.selectedActivity; },
    onClickActivity: function (activity) { return stateProps.connectionSelectedActivity && (function () { return stateProps.connectionSelectedActivity.next({ activity: activity }); }); },
    onCardAction: ownProps.onCardAction
}); }, {
    withRef: true
})(HistoryView);
var getComputedStyleValues = function (el, stylePropertyNames) {
    var s = window.getComputedStyle(el);
    var result = {};
    stylePropertyNames.forEach(function (name) { return result[name] = parseInt(s.getPropertyValue(name)); });
    return result;
};
var measurePaddedHeight = function (el) {
    var paddingTop = 'padding-top', paddingBottom = 'padding-bottom';
    var values = getComputedStyleValues(el, [paddingTop, paddingBottom]);
    return el.offsetHeight - values[paddingTop] - values[paddingBottom];
};
var measurePaddedWidth = function (el) {
    var paddingLeft = 'padding-left', paddingRight = 'padding-right';
    var values = getComputedStyleValues(el, [paddingLeft, paddingRight]);
    return el.offsetWidth + values[paddingLeft] + values[paddingRight];
};
var suitableInterval = function (current, next) {
    return Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;
};
var WrappedActivity = (function (_super) {
    tslib_1.__extends(WrappedActivity, _super);
    function WrappedActivity(props) {
        var _this = _super.call(this, props) || this;
        _this.sendPositiveFeedback = function () {
            var uid = null;
            var action = null;
            var question = null;
            // dispatch action
            _this.props.onSendPositiveFeedback();
            // changing visibility to avatar client message
            if (_this.props.activity.type === 'message' &&
                _this.props.activity.entities &&
                _this.props.activity.entities.length > 0) {
                if (_this.props.activity.entities[0].showMessage)
                    _this.props.activity.entities[0].showMessage = false;
                if (_this.props.activity.entities[0].trackable)
                    _this.props.activity.entities[0].trackable = false;
                if (_this.props.activity.entities[0].uid)
                    uid = _this.props.activity.entities[0].uid;
                if (_this.props.activity.entities[0].action)
                    action = _this.props.activity.entities[0].action;
                if (_this.props.activity.entities[0].action)
                    question = _this.props.activity.entities[0].question;
            }
            // sending to api the feedback action to api
            var response = api_1.giveFeedback({
                id: _this.props.activity.id,
                type: 'like',
                uid: uid,
                action: action,
                question: question
            });
            konsole.log('response giveFeedback like', response);
        };
        _this.sendNegativeFeedback = function () {
            var uid = null;
            var action = null;
            var question = null;
            // dispatch action
            _this.props.onSendNegativeFeedback();
            // changing visibility to avatar client message
            if (_this.props.activity.type === 'message' &&
                _this.props.activity.entities &&
                _this.props.activity.entities.length > 0) {
                if (_this.props.activity.entities[0].showMessage)
                    _this.props.activity.entities[0].showMessage = false;
                if (_this.props.activity.entities[0].trackable)
                    _this.props.activity.entities[0].trackable = false;
                if (_this.props.activity.entities[0].uid)
                    uid = _this.props.activity.entities[0].uid;
                if (_this.props.activity.entities[0].action)
                    action = _this.props.activity.entities[0].action;
                if (_this.props.activity.entities[0].action)
                    question = _this.props.activity.entities[0].question;
            }
            // sending to api the feedback action to api
            var response = api_1.giveFeedback({
                id: _this.props.activity.id,
                type: 'dislike',
                uid: uid,
                action: action,
                question: question
            });
            konsole.log('response giveFeedback dislike', response);
        };
        _this.MessageFailure = function () {
            // dispatch action
            _this.props.onMessageFailure();
            _this.props.onReceiveMessage();
            _this.props.activity.id = "";
        };
        return _this;
    }
    WrappedActivity.prototype.render = function () {
        var _this = this;
        var timeLine;
        var who = this.props.fromMe ? 'me' : (this.props.activity.id != '' ? (this.props.activity.type === 'typing' ? 'typing' : 'bot') : 'init');
        var isEntityTrackable = !this.props.fromMe && (this.props.activity.type === 'message' && this.props.activity.entities && this.props.activity.entities[0].trackable);
        var flagShowBotMessage = (this.props.activity.type === 'message') ?
            ((this.props.activity.inputHint === 'welcome') ||
                (this.props.activity.entities && this.props.activity.entities[0].showMessage)) : false;
        var videoIframe = (this.props.activity.type === 'message' && this.props.activity.entities && this.props.activity.entities[0].videoIframe);
        var videoUri = (this.props.activity.type === 'message' && this.props.activity.entities && this.props.activity.entities[0].videoUri);
        switch (this.props.activity.id) {
            case undefined:
                timeLine = React.createElement("span", null, this.props.format.strings.messageSending);
                break;
            case null:
                timeLine = React.createElement("span", null, this.props.format.strings.messageFailed);
                this.MessageFailure();
                break;
            case "retry":
                timeLine =
                    React.createElement("span", null,
                        this.props.format.strings.messageFailed,
                        ' ',
                        React.createElement("a", { href: ".", onClick: this.props.onClickRetry }, this.props.format.strings.messageRetry));
                this.MessageFailure();
                break;
            default:
                var sent = void 0;
                if (this.props.showTimestamp)
                    sent = this.props.format.strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
                timeLine = React.createElement("span", null,
                    this.props.activity.from.name || this.props.activity.from.id,
                    sent);
                timeLine = React.createElement("span", null, sent);
                break;
        }
        var wrapperClassName;
        if (this.props.fromMe) {
            wrapperClassName = Chat_1.classList('wdrgy-wc-message-wrapper-me', this.props.activity.attachmentLayout || 'list', this.props.onClickActivity && 'clickable');
        }
        else {
            wrapperClassName = Chat_1.classList('wdrgy-wc-message-wrapper', this.props.activity.attachmentLayout || 'list', this.props.onClickActivity && 'clickable');
        }
        var contentClassName = Chat_1.classList('wdrgy-wc-message-content', this.props.selected && 'selected');
        //formatting dynamic style for bot icon
        var avatarClassName = 'wdrgy-avatar';
        if (!flagShowBotMessage)
            avatarClassName += '-hidden';
        return (React.createElement("div", { "data-activity-id": this.props.activity.id, className: wrapperClassName, onClick: this.props.onClickActivity },
            React.createElement("div", { className: 'wdrgy-wc-message wdrgy-wc-message-from-' + who, ref: function (div) { return _this.messageDiv = div; } },
                who === 'bot' &&
                    React.createElement("img", { className: avatarClassName, src: ic_avatar, alt: "avatar" }),
                React.createElement("div", { className: contentClassName },
                    ((who === 'bot' || who === 'me') && !videoIframe) &&
                        this.props.children,
                    (who === 'bot' && videoIframe) &&
                        React.createElement("div", null,
                            React.createElement("div", { className: "wc-list" },
                                React.createElement("div", { className: "wc-card wc-adaptive-card video" },
                                    React.createElement("div", { className: "non-adaptive-content" },
                                        React.createElement("iframe", { allowFullScreen: true, src: videoUri }))))),
                    who === 'typing' &&
                        React.createElement("div", { className: "wdrgy-wc-typing" }))),
            React.createElement("div", { className: 'wdrgy-wc-message-bottom-' + who },
                who === 'me' &&
                    React.createElement("div", { className: "wdrgy-triangle-topright" }),
                who === 'bot' && !videoIframe && flagShowBotMessage &&
                    React.createElement("div", { className: "wdrgy-triangle-topleft" }),
                isEntityTrackable &&
                    React.createElement("div", { className: 'wdrgy-wc-message-from-feedback' },
                        React.createElement("div", { className: "wdrgy-feedback" },
                            React.createElement("span", { className: "wdrgy-wc-message-from wdrgy-wc-message-from-feedback" }, "\u00BFResolv\u00ED tu consulta?")),
                        React.createElement("div", { className: "wdrgy-feedback" },
                            React.createElement("button", { className: "wdrgy-feedback-button", onClick: this.sendPositiveFeedback },
                                React.createElement("img", { src: ic_like, className: "wdrgy-feedback-icon", alt: "like" }))),
                        React.createElement("div", { className: "wdrgy-feedback" },
                            React.createElement("button", { className: "wdrgy-feedback-button", onClick: this.sendNegativeFeedback },
                                React.createElement("img", { src: ic_dislike, className: "wdrgy-feedback-icon", alt: "dislike" })))))));
    };
    return WrappedActivity;
}(React.Component));
exports.WrappedActivity = WrappedActivity;
//# sourceMappingURL=History.js.map