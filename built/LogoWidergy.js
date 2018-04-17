"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var react_redux_1 = require("react-redux");
var ic_logo_widergy = require('./assets/ic_logoWidergy@1x.png');
var LogoWidergy = (function (_super) {
    tslib_1.__extends(LogoWidergy, _super);
    function LogoWidergy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LogoWidergy.prototype.render = function () {
        if (this.props.showLogoWidergy) {
            return (React.createElement("div", { className: "wdrgy-wc-logo-widergy" },
                React.createElement("a", { href: "https://www.widergy.com", target: "_blank" },
                    React.createElement("img", { className: "wdrgy-widergy-icon", src: ic_logo_widergy, title: "Widergy - Agent UtilityGO!", alt: "Widergy - Agent UtilityGO!" }))));
        }
        return null;
    };
    return LogoWidergy;
}(React.Component));
exports.default = react_redux_1.connect(function (state) { return ({
    showLogoWidergy: state.logoWidergy.showLogoWidergy
}); }, {}, function (stateProps, dispatchProps, ownProps) { return ({
    showLogoWidergy: stateProps.showLogoWidergy
}); })(LogoWidergy);
//# sourceMappingURL=LogoWidergy.js.map