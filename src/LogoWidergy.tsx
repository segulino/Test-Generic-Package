import * as React from 'react';
import { Dispatch, connect } from 'react-redux';
import { ChatState } from './Store';

const ic_logo_widergy = require('./assets/ic_logoWidergy@1x.png');

interface Props {
  showLogoWidergy: true,
}

class LogoWidergy extends React.Component<Props, {}> {

  render() {
    if (this.props.showLogoWidergy) {
      return (
        <div className="wdrgy-wc-logo-widergy">
          <a href="https://www.widergy.com" target="_blank">
            <img className="wdrgy-widergy-icon" src={ic_logo_widergy} title="Widergy - Agent UtilityGO!" alt="Widergy - Agent UtilityGO!" />
          </a>
        </div>
      );
    }
    return null;
  }
}

export default connect(
  (state: ChatState) => ({
    showLogoWidergy: state.logoWidergy.showLogoWidergy
  }),{},
  (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
    showLogoWidergy: stateProps.showLogoWidergy
  })
) (LogoWidergy);
