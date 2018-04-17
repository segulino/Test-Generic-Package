"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Chat_1 = require("./Chat");
var react_redux_1 = require("react-redux");
var SpeechModule_1 = require("./SpeechModule");
var Store_1 = require("./Store");
var Menu_1 = require("./Menu");
var ic_send = require('./assets/ic_send_arrow_blue@2x.png');
var ic_attach = require('./assets/ic_attach@2x.png');
var ShellContainer = (function (_super) {
    tslib_1.__extends(ShellContainer, _super);
    function ShellContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ShellContainer.prototype.sendMessage = function () {
        if (this.props.inputText.trim().length > 0) {
            this.props.sendMessage(this.props.inputText);
            this.focus();
        }
    };
    ShellContainer.prototype.handleSendButtonKeyPress = function (evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.sendMessage();
            this.textInput.focus();
        }
    };
    ShellContainer.prototype.handleUploadButtonKeyPress = function (evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.fileInput.click();
        }
    };
    ShellContainer.prototype.onKeyPress = function (e) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    };
    ShellContainer.prototype.onClickSend = function () {
        this.sendMessage();
    };
    ShellContainer.prototype.onChangeFile = function () {
        this.props.sendFiles(this.fileInput.files);
        this.fileInput.value = null;
        this.textInput.focus();
    };
    ShellContainer.prototype.onTextInputFocus = function () {
        if (this.props.listeningState === Store_1.ListeningState.STARTED) {
            this.props.stopListening();
        }
    };
    ShellContainer.prototype.onClickMic = function () {
        if (this.props.listeningState === Store_1.ListeningState.STARTED) {
            this.props.stopListening();
        }
        else if (this.props.listeningState === Store_1.ListeningState.STOPPED) {
            this.props.startListening();
        }
    };
    ShellContainer.prototype.focus = function (appendKey) {
        this.textInput.focus();
        if (appendKey) {
            this.props.onChangeText(this.props.inputText + appendKey);
        }
    };
    ShellContainer.prototype.render = function () {
        var _this = this;
        var className = Chat_1.classList('wdrgy-wc-console', this.props.inputText.length > 0 && 'has-text', this.props.showUploadButton && 'has-upload-button');
        var showMicButton = this.props.listeningState !== Store_1.ListeningState.STOPPED || (SpeechModule_1.Speech.SpeechRecognizer.speechIsAvailable() && !this.props.inputText.length);
        var sendButtonClassName = Chat_1.classList('wdrgy-wc-send', 'wdrgy-align-center', showMicButton && 'hidden');
        var micButtonClassName = Chat_1.classList('wdrgy-wc-mic', !showMicButton && 'hidden', this.props.listeningState === Store_1.ListeningState.STARTED && 'active', this.props.listeningState !== Store_1.ListeningState.STARTED && 'inactive');
        var placeholder = this.props.listeningState === Store_1.ListeningState.STARTED ? this.props.strings.listeningIndicator : this.props.strings.consolePlaceholder;
        return (React.createElement("div", { className: "wdrgy-wc-shell-panel-group" },
            this.props.processingMessage &&
                React.createElement("div", { className: "wdrgy-wc-indicator" },
                    React.createElement("div", { className: "wdrgy-progress" },
                        React.createElement("div", { className: "wdrgy-progress-bar" }))),
            React.createElement("div", { className: className },
                React.createElement(Menu_1.default, null),
                React.createElement("input", { type: "text", className: "wdrgy-wc-shellinput", ref: function (input) { return _this.textInput = input; }, disabled: this.props.processingMessage, autoFocus: true, value: this.props.inputText, onChange: function (_) { return _this.props.onChangeText(_this.textInput.value); }, onKeyPress: function (e) { return _this.onKeyPress(e); }, onFocus: function () { return _this.onTextInputFocus(); }, placeholder: placeholder, "aria-label": this.props.inputText ? null : placeholder, "aria-live": "polite" }),
                this.props.inputText !== '' &&
                    React.createElement("label", { className: sendButtonClassName, onClick: function () { return _this.onClickSend(); } },
                        React.createElement("img", { className: "wdrgy-console-icon", src: ic_send, alt: "send" })))));
    };
    return ShellContainer;
}(React.Component));
exports.Shell = react_redux_1.connect(function (state) { return ({
    // passed down to ShellContainer
    inputText: state.shell.input,
    showUploadButton: state.format.showUploadButton,
    strings: state.format.strings,
    processingMessage: state.shell.processingMessage,
    // only used to create helper functions below
    locale: state.format.locale,
    user: state.connection.user,
    listeningState: state.shell.listeningState
}); }, {
    // passed down to ShellContainer
    onChangeText: function (input) { return ({ type: 'Update_Input', input: input, source: "text" }); },
    stopListening: function () { return ({ type: 'Listening_Stop' }); },
    startListening: function () { return ({ type: 'Listening_Starting' }); },
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage,
    showTyping: Store_1.showTyping,
    sendFiles: Store_1.sendFiles
}, function (stateProps, dispatchProps, ownProps) { return ({
    // from stateProps
    inputText: stateProps.inputText,
    showUploadButton: stateProps.showUploadButton,
    strings: stateProps.strings,
    listeningState: stateProps.listeningState,
    processingMessage: stateProps.processingMessage,
    // from dispatchProps
    onChangeText: dispatchProps.onChangeText,
    // helper functions
    sendMessage: function (text) { return dispatchProps.sendMessage(text, stateProps.user, stateProps.locale); },
    sendFiles: function (files) { return dispatchProps.sendFiles(files, stateProps.user, stateProps.locale); },
    showTyping: function () { return dispatchProps.showTyping(); },
    startListening: function () { return dispatchProps.startListening(); },
    stopListening: function () { return dispatchProps.stopListening(); }
}); }, {
    withRef: true
})(ShellContainer);
//# sourceMappingURL=Shell.js.map