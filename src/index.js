import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TopNav from './topnav';
import Content from './content';

import registerServiceWorker from './registerServiceWorker';
ReactDOM.render(<TopNav />, document.getElementById('header'));
ReactDOM.render(<Content />, document.getElementById('content'));
registerServiceWorker();
