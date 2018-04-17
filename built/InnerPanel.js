"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var react_redux_1 = require("react-redux");
var Store_1 = require("./Store");
var Strings_1 = require("./Strings");
var actions = Strings_1.defaultStrings.actions;
var InnerPanel = (function (_super) {
    tslib_1.__extends(InnerPanel, _super);
    function InnerPanel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sendMessage = function (text) {
            _this.props.sendMessage(text);
            _this.props.toggleInnerPanel();
        };
        return _this;
    }
    InnerPanel.prototype.render = function () {
        var _this = this;
        if (this.props.showInnerPanel) {
            return (React.createElement("div", { className: "wdrgy-inner-panel" }, this.props.innerActions.map(function (action, index) {
                return React.createElement("button", { className: "wdrgy-inner-action", key: index, onClick: function () { return _this.sendMessage(action); } }, action);
            })));
        }
        return null;
    };
    return InnerPanel;
}(React.Component));
exports.default = react_redux_1.connect(function (state) { return ({
    showInnerPanel: state.freqActions.showInnerPanel,
    innerActions: state.freqActions.innerActions,
    // only used to create helper functions below
    locale: state.format.locale,
    user: state.connection.user,
}); }, {
    showTyping: Store_1.showTyping,
    sendMessage: Store_1.sendMessage,
    toggleInnerPanel: Store_1.toggleInnerPanel
}, function (stateProps, dispatchProps, ownProps) { return ({
    showInnerPanel: stateProps.showInnerPanel,
    innerActions: stateProps.innerActions,
    showTyping: function () { return dispatchProps.showTyping(); },
    sendMessage: function (text) { return dispatchProps.sendMessage(text, stateProps.user, stateProps.locale); },
    toggleInnerPanel: dispatchProps.toggleInnerPanel
}); })(InnerPanel);
//# sourceMappingURL=InnerPanel.js.map