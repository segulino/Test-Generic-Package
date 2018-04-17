import * as React from 'react';
import { Dispatch, connect } from 'react-redux';
import { ChatState, sendMessage, hideActionsPanel } from './Store';
import { defaultStrings } from './Strings';
import LogoWidergy from './LogoWidergy';

const ic_frequentIcon = require('./assets/ic_frequentIcon@1x.png');
const ic_close = require('./assets/ic_close@1x.png');
const ic_logo_widergy = require('./assets/ic_logoWidergy@1x.png');

const actions = defaultStrings.actions;

interface Props {
  showChat: boolean,
  actions: Array<string>,
  processingMessage: boolean,

  sendMessage: (inputText: string) => void,
  hideActionsPanel: () => void
}

class FrequentActionsPane extends React.Component<Props, {}> {

  private sendMessage = (text: string) => {
    this.props.sendMessage(text);
  }

  render(){
    if (this.props.showChat) {
      return (
        <div className="wdrgy-actions-menu">
          <div className="wdrgy-wc-header-frequent">
            <div className="wdrgy-brand">
              <span className="wdrgy-title">PREGUNTAS FRECUENTES</span>
            </div>
            <div>
              <button type="button" className="wdrgy-close-button" onClick={this.props.hideActionsPanel}>
                <img className="wdrgy-close" src={ic_close} alt="close" />
              </button>
            </div>
          </div>
          <div className="wdrgy-frequent-container">
            <div className="wdrgy-actions-container">
              {
                this.props.actions.map((action, index) =>
                  <div className="wdrgy-action-row">
                    <img className="wdrgy-frecuent-icon" src={ic_frequentIcon} />
                    <button className="wdrgy-action" disabled={this.props.processingMessage} key={index} onClick={() => this.sendMessage(action)}>
                      { action }
                    </button>
                  </div>
                )
              }
            </div>
            <LogoWidergy/>
          </div>
        </div>
      );
    }
    return null;
  }
}

export default connect(
  (state: ChatState) => ({
    showChat: state.freqActions.showPanel,
    actions: state.freqActions.actions,
    processingMessage: state.shell.processingMessage,
    // only used to create helper functions below
    locale: state.format.locale,
    user: state.connection.user,
  }),{
    sendMessage,
    hideActionsPanel
  },
  (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
    showChat: stateProps.showChat,
    actions: stateProps.actions,
    processingMessage: stateProps.processingMessage,
    sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
    hideActionsPanel: dispatchProps.hideActionsPanel
  }), {
    withRef: true
  }
)(FrequentActionsPane);
