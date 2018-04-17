"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_redux_1 = require("react-redux");
var Store_1 = require("./Store");
var ic_menu = require('./assets/ic_menu@2x.png');
var ic_arrow = require('./assets/ic_arrow@1x.png');
var Menu = function (props) {
    return React.createElement("div", { className: "wdrgy-menu" },
        React.createElement("button", { type: "button", className: "wdrgy-menu-button", disabled: props.processingMessage, onClick: props.toggleInnerPanel },
            React.createElement("img", { className: props.showInnerPanel ? "wdrgy-close-icon" : "wdrgy-menu-icon", src: props.showInnerPanel ? ic_arrow : ic_menu, alt: "menu" })));
};
exports.default = react_redux_1.connect(function (state) { return ({
    showInnerPanel: state.freqActions.showInnerPanel,
    processingMessage: state.shell.processingMessage
}); }, {
    toggleInnerPanel: Store_1.toggleInnerPanel
}, function (stateProps, dispatchProps, ownProps) { return ({
    showInnerPanel: stateProps.showInnerPanel,
    toggleInnerPanel: dispatchProps.toggleInnerPanel,
    processingMessage: stateProps.processingMessage
}); })(Menu);
//# sourceMappingURL=Menu.js.map