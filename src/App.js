import React from 'react';
import { Router, Route } from 'react-router-dom';
import HomePage from './HomePage';
import TopBar from './TopBar';
import { createBrowserHistory as createHistory } from 'history';
import './App.css';
import ChatRoomPage from './ChatRoomPage';
const history = createHistory();

function App() {
  console.log('Working');
  return (
    <div className="App">
      <Router history={history}>
        <TopBar />
        <Route path="/:chatRoomId" exact component={HomePage} />
        <Route
          path="/chatroom/"
          exact
          render={(props) => <ChatRoomPage {...props} />}
        />
      </Router>
    </div>
  );
}
export default App;
