import * as React from 'react';
import { ChatState, FormatState } from './Store';
import { User } from 'botframework-directlinejs';
import { classList } from './Chat';
import { Dispatch, connect } from 'react-redux';
import { Strings } from './Strings';
import { Speech } from './SpeechModule'
import { ChatActions, ListeningState, sendMessage, showTyping, sendFiles } from './Store';
import Menu from './Menu';

const ic_send = require('./assets/ic_send_arrow_blue@2x.png');
const ic_attach = require('./assets/ic_attach@2x.png');

interface Props {
  inputText: string,
  strings: Strings,
  listeningState: ListeningState,
  processingMessage: true,
  showUploadButton: boolean

  onChangeText: (inputText: string) => void

  sendMessage: (inputText: string) => void,
  sendFiles: (files: FileList) => void,
  stopListening: () => void,
  startListening: () => void
  showTyping: () => void
}

export interface ShellFunctions {
  focus: (appendKey?: string) => void
}

class ShellContainer extends React.Component<Props> implements ShellFunctions {
  private textInput: HTMLInputElement;
  private fileInput: HTMLInputElement;

  private sendMessage() {
        if (this.props.inputText.trim().length > 0) {
      this.props.sendMessage(this.props.inputText);
      this.focus();
    }
  }

    private handleSendButtonKeyPress(evt: React.KeyboardEvent<HTMLButtonElement>) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.sendMessage();
            this.textInput.focus();
        }
    }

    private handleUploadButtonKeyPress(evt: React.KeyboardEvent<HTMLLabelElement>) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.fileInput.click();
        }
    }

  private onKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      this.sendMessage();
    }
  }

  private onClickSend() {
    this.sendMessage();
  }

  private onChangeFile() {
    this.props.sendFiles(this.fileInput.files);
    this.fileInput.value = null;
    this.textInput.focus();
  }

    private onTextInputFocus(){
        if (this.props.listeningState === ListeningState.STARTED) {
      this.props.stopListening();
    }
  }

  private onClickMic() {
        if (this.props.listeningState === ListeningState.STARTED) {
      this.props.stopListening();
        } else if (this.props.listeningState === ListeningState.STOPPED) {
      this.props.startListening();
    }
  }

  public focus(appendKey?: string) {
    this.textInput.focus();

    if (appendKey) {
      this.props.onChangeText(this.props.inputText + appendKey);
    }
  }

  render() {
    const className = classList(
      'wdrgy-wc-console',
      this.props.inputText.length > 0 && 'has-text',
      this.props.showUploadButton && 'has-upload-button'
    );

    const showMicButton = this.props.listeningState !== ListeningState.STOPPED || (Speech.SpeechRecognizer.speechIsAvailable()  && !this.props.inputText.length);

    const sendButtonClassName = classList(
      'wdrgy-wc-send',
      'wdrgy-align-center',
      showMicButton && 'hidden'
    );

    const micButtonClassName = classList(
      'wdrgy-wc-mic',
      !showMicButton && 'hidden',
            this.props.listeningState === ListeningState.STARTED && 'active',
            this.props.listeningState !== ListeningState.STARTED && 'inactive'
    );

    const placeholder = this.props.listeningState === ListeningState.STARTED ? this.props.strings.listeningIndicator : this.props.strings.consolePlaceholder;

    return (
      <div className="wdrgy-wc-shell-panel-group">
        {
          this.props.processingMessage &&
            <div className="wdrgy-wc-indicator">
              <div className="wdrgy-progress">
                <div className="wdrgy-progress-bar">
                </div>
              </div>
            </div>
        }
        <div className={className}>
          <Menu />
          {
          /*
          this.props.showUploadButton &&
          <label
          className="wc-upload"
          htmlFor="wc-upload-input"
          onKeyPress={ evt => this.handleUploadButtonKeyPress(evt) }
          tabIndex={ 0 } >
          <svg>
            <path d="M19.96 4.79m-2 0a2 2 0 0 1 4 0 2 2 0 0 1-4 0zM8.32 4.19L2.5 15.53 22.45 15.53 17.46 8.56 14.42 11.18 8.32 4.19ZM1.04 1L1.04 17 24.96 17 24.96 1 1.04 1ZM1.03 0L24.96 0C25.54 0 26 0.45 26 0.99L26 17.01C26 17.55 25.53 18 24.96 18L1.03 18C0.46 18 0 17.55 0 17.01L0 0.99C0 0.45 0.47 0 1.03 0Z" />
          </svg>
          </label>
          */
          }
          {
          /*
          this.props.showUploadButton &&
          <input
            id="wc-upload-input"
            tabIndex={ -1 }
            type="file"
            ref={ input => this.fileInput = input }
            multiple
            onChange={ () => this.onChangeFile() }
            aria-label={ this.props.strings.uploadFile }
            role="button"
          />
          */
          }
          <input
              type="text"
              className="wdrgy-wc-shellinput"
              ref={ input => this.textInput = input }
              disabled={this.props.processingMessage}
              autoFocus
              value={ this.props.inputText }
              onChange={ _ => this.props.onChangeText(this.textInput.value) }
              onKeyPress={ e => this.onKeyPress(e) }
              onFocus={ () => this.onTextInputFocus() }
              placeholder={ placeholder }
              aria-label={ this.props.inputText ? null : placeholder }
              aria-live="polite"
          />
          {
          this.props.inputText !== '' &&
          <label
            className={sendButtonClassName}
            onClick={ () => this.onClickSend() } >
            <img className="wdrgy-console-icon" src={ic_send} alt="send" />
          </label>
          }
          {
          /*
          <button
            className={ micButtonClassName }
            onClick={ () => this.onClickMic() }
            aria-label={ this.props.strings.speak }
            role="button"
            tabIndex={ 0 }
            type="button"
          >
          <svg width="28" height="22" viewBox="0 0 58 58" >
            <path d="M 44 28 C 43.448 28 43 28.447 43 29 L 43 35 C 43 42.72 36.72 49 29 49 C 21.28 49 15 42.72 15 35 L 15 29 C 15 28.447 14.552 28 14 28 C 13.448 28 13 28.447 13 29 L 13 35 C 13 43.485 19.644 50.429 28 50.949 L 28 56 L 23 56 C 22.448 56 22 56.447 22 57 C 22 57.553 22.448 58 23 58 L 35 58 C 35.552 58 36 57.553 36 57 C 36 56.447 35.552 56 35 56 L 30 56 L 30 50.949 C 38.356 50.429 45 43.484 45 35 L 45 29 C 45 28.447 44.552 28 44 28 Z"/>
            <path id="micFilling" d="M 28.97 44.438 L 28.97 44.438 C 23.773 44.438 19.521 40.033 19.521 34.649 L 19.521 11.156 C 19.521 5.772 23.773 1.368 28.97 1.368 L 28.97 1.368 C 34.166 1.368 38.418 5.772 38.418 11.156 L 38.418 34.649 C 38.418 40.033 34.166 44.438 28.97 44.438 Z"/>
            <path d="M 29 46 C 35.065 46 40 41.065 40 35 L 40 11 C 40 4.935 35.065 0 29 0 C 22.935 0 18 4.935 18 11 L 18 35 C 18 41.065 22.935 46 29 46 Z M 20 11 C 20 6.037 24.038 2 29 2 C 33.962 2 38 6.037 38 11 L 38 35 C 38 39.963 33.962 44 29 44 C 24.038 44 20 39.963 20 35 L 20 11 Z"/>
          </svg>
        </button>
        */
        }
      </div>
    </div>
    );
  }
}

export const Shell = connect(
  (state: ChatState) => ({
    // passed down to ShellContainer
    inputText: state.shell.input,
    showUploadButton: state.format.showUploadButton,
    strings: state.format.strings,
    processingMessage: state.shell.processingMessage,
    // only used to create helper functions below
    locale: state.format.locale,
    user: state.connection.user,
    listeningState : state.shell.listeningState
  }), {
    // passed down to ShellContainer
    onChangeText: (input: string) => ({ type: 'Update_Input', input, source: "text" } as ChatActions),
    stopListening:  () => ({ type: 'Listening_Stop' }),
    startListening:  () => ({ type: 'Listening_Starting' }),
    // only used to create helper functions below
    sendMessage,
    showTyping,
    sendFiles
  }, (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
    // from stateProps
    inputText: stateProps.inputText,
    showUploadButton: stateProps.showUploadButton,
    strings: stateProps.strings,
    listeningState: stateProps.listeningState,
    processingMessage: stateProps.processingMessage,
    // from dispatchProps
    onChangeText: dispatchProps.onChangeText,
    // helper functions
    sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
    sendFiles: (files: FileList) => dispatchProps.sendFiles(files, stateProps.user, stateProps.locale),
    showTyping: () => dispatchProps.showTyping(),
    startListening: () => dispatchProps.startListening(),
    stopListening: () => dispatchProps.stopListening()
  }), {
    withRef: true
  }
)(ShellContainer);
