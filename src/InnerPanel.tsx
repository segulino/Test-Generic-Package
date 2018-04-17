import * as React from 'react';
import { Dispatch, connect } from 'react-redux';
import { ChatState, sendMessage, showTyping, toggleInnerPanel } from './Store';
import { defaultStrings } from './Strings';

const actions = defaultStrings.actions;

interface Props {
  showInnerPanel: boolean,
  innerActions: Array<string>,

  showTyping: () => void,
  sendMessage: (inputText: string) => void,
  toggleInnerPanel: () => void
}

class InnerPanel extends React.Component<Props, {}> {

  private sendMessage = (text: string) => {
    this.props.sendMessage(text);
    this.props.toggleInnerPanel();
  }

  render() {
    if (this.props.showInnerPanel) {
      return (
        <div className="wdrgy-inner-panel">
          {
            this.props.innerActions.map((action, index) =>
              <button className="wdrgy-inner-action" key={index} onClick={() => this.sendMessage(action)}>
                { action }
              </button>
            )
          }
        </div>
      );
    }
    return null;
  }
}

export default connect(
  (state: ChatState) => ({
    showInnerPanel: state.freqActions.showInnerPanel,
    innerActions: state.freqActions.innerActions,
    // only used to create helper functions below
    locale: state.format.locale,
    user: state.connection.user,
  }), {
    showTyping,
    sendMessage,
    toggleInnerPanel
  },
  (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
    showInnerPanel: stateProps.showInnerPanel,
    innerActions: stateProps.innerActions,
    showTyping: () => dispatchProps.showTyping(),
    sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
    toggleInnerPanel: dispatchProps.toggleInnerPanel
  })
) (InnerPanel);
