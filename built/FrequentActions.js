"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var react_redux_1 = require("react-redux");
var Store_1 = require("./Store");
var Strings_1 = require("./Strings");
var LogoWidergy_1 = require("./LogoWidergy");
var ic_frequentIcon = require('./assets/ic_frequentIcon@1x.png');
var ic_close = require('./assets/ic_close@1x.png');
var ic_logo_widergy = require('./assets/ic_logoWidergy@1x.png');
var actions = Strings_1.defaultStrings.actions;
var FrequentActionsPane = (function (_super) {
    tslib_1.__extends(FrequentActionsPane, _super);
    function FrequentActionsPane() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sendMessage = function (text) {
            _this.props.sendMessage(text);
        };
        return _this;
    }
    FrequentActionsPane.prototype.render = function () {
        var _this = this;
        if (this.props.showChat) {
            return (React.createElement("div", { className: "wdrgy-actions-menu" },
                React.createElement("div", { className: "wdrgy-wc-header-frequent" },
                    React.createElement("div", { className: "wdrgy-brand" },
                        React.createElement("span", { className: "wdrgy-title" }, "PREGUNTAS FRECUENTES")),
                    React.createElement("div", null,
                        React.createElement("button", { type: "button", className: "wdrgy-close-button", onClick: this.props.hideActionsPanel },
                            React.createElement("img", { className: "wdrgy-close", src: ic_close, alt: "close" })))),
                React.createElement("div", { className: "wdrgy-frequent-container" },
                    React.createElement("div", { className: "wdrgy-actions-container" }, this.props.actions.map(function (action, index) {
                        return React.createElement("div", { className: "wdrgy-action-row" },
                            React.createElement("img", { className: "wdrgy-frecuent-icon", src: ic_frequentIcon }),
                            React.createElement("button", { className: "wdrgy-action", disabled: _this.props.processingMessage, key: index, onClick: function () { return _this.sendMessage(action); } }, action));
                    })),
                    React.createElement(LogoWidergy_1.default, null))));
        }
        return null;
    };
    return FrequentActionsPane;
}(React.Component));
exports.default = react_redux_1.connect(function (state) { return ({
    showChat: state.freqActions.showPanel,
    actions: state.freqActions.actions,
    processingMessage: state.shell.processingMessage,
    // only used to create helper functions below
    locale: state.format.locale,
    user: state.connection.user,
}); }, {
    sendMessage: Store_1.sendMessage,
    hideActionsPanel: Store_1.hideActionsPanel
}, function (stateProps, dispatchProps, ownProps) { return ({
    showChat: stateProps.showChat,
    actions: stateProps.actions,
    processingMessage: stateProps.processingMessage,
    sendMessage: function (text) { return dispatchProps.sendMessage(text, stateProps.user, stateProps.locale); },
    hideActionsPanel: dispatchProps.hideActionsPanel
}); }, {
    withRef: true
})(FrequentActionsPane);
//# sourceMappingURL=FrequentActions.js.map