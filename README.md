# Edenor-Ugo---Chatbot-Front
UtilityGO! Chatbot Front-End implementation for Edenor chatbot agent UtilitGO!.

This project has it's base on Microsoft Bot Framework Web Chat (TypeScript + SASS + Adaptive Cards).

## Development

To start this project in your local enviroment, use the command `npm start` or `yarn start` and the local server will be up and running. Now, you need to build the project using `npm run build` and the files builded will be served in the port the first command tells you.

As far as development goes, there's no hot-reload added so you need to build every time you want to see the changes you made in the local host.

### Styles

This project is using SASS for it's styles. You will find a file that contains all the styles for the chat and it's responsive design.

To style the Adaptive Cards, there are some styles in that file but mostly you need to change the configuration in `adaptive-card-config.scss`. Please, read the [Adaptive Cards](./AdaptiveCards.md) document for more information.


### TypeScript

For components, you will use TypeScript. To create a component, simply create the file and add the React import statement. Keep in mind that you will need to add a Props Interface so you can specify the Props' types. For example:

```typescript
import * as React from 'react';

interface Props {
  text: string
}

class MyComponent extends Reac.Component<Props, {}> {
  ...
}

export default MyComponent;
```

### Deploy

You only need to deploy the following files:

- **index.html**
- **botchat.js**
- **botchat.css**
- **botchat-fullwindow.css**

Those are the files that are creating with the build command.



The original Readme of the framework is [here](./BotFramework.md)
# UtilityGO---Chatbot-Front
UtilityGO! Chatbot Front-End

This project has it's base on Microsoft Bot Framework Web Chat (TypeScript + SASS + Adaptive Cards).

## Development

To start this project in your local enviroment, use the command `npm start` or `yarn start` and the local server will be up and running. Now, you need to build the project using `npm run build` and the files builded will be served in the port the first command tells you.

As far as development goes, there's no hot-reload added so you need to build every time you want to see the changes you made in the local host.

### Styles

This project is using SASS for it's styles. You will find a file that contains all the styles for the chat and it's responsive design.

To style the Adaptive Cards, there are some styles in that file but mostly you need to change the configuration in `adaptive-card-config.scss`. Please, read the [Adaptive Cards](./AdaptiveCards.md) document for more information.


### TypeScript

For components, you will use TypeScript. To create a component, simply create the file and add the React import statement. Keep in mind that you will need to add a Props Interface so you can specify the Props' types. For example:

```typescript
import * as React from 'react';

interface Props {
  text: string
}

class MyComponent extends Reac.Component<Props, {}> {
  ...
}

export default MyComponent;
```

### Deploy

You only need to deploy the following files:

- **index.html**
- **botchat.js**
- **botchat.css**
- **botchat-fullwindow.css**

Those are the files that are creating with the build command.



The original Readme of the framework is [here](./BotFramework.md)
