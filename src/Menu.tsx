import * as React from 'react';
import { connect } from 'react-redux';
import { ChatState, FormatState, toggleInnerPanel } from './Store';

import InnerPannel from './InnerPanel';

const ic_menu = require('./assets/ic_menu@2x.png');
const ic_arrow = require('./assets/ic_arrow@1x.png');

interface Props {
  showInnerPanel: boolean,
  processingMessage: boolean,
  toggleInnerPanel: () => void
}

const Menu = (props: Props) =>
  <div className="wdrgy-menu">
    <button type="button" className="wdrgy-menu-button" disabled={props.processingMessage} onClick={props.toggleInnerPanel}>
      <img
        className={props.showInnerPanel ? "wdrgy-close-icon" : "wdrgy-menu-icon"}
        src={props.showInnerPanel ? ic_arrow : ic_menu}
        alt="menu"
      />
    </button>
  </div>;

export default connect(
  (state: ChatState) => ({
    showInnerPanel: state.freqActions.showInnerPanel,
    processingMessage: state.shell.processingMessage
  }),{
    toggleInnerPanel
  },
  (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
    showInnerPanel: stateProps.showInnerPanel,
    toggleInnerPanel: dispatchProps.toggleInnerPanel,
    processingMessage: stateProps.processingMessage
  })
)(Menu);
