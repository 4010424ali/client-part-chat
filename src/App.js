import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import { Redirect } from "react-router-dom";
import HomePage from './HomePage';
import TopBar from './TopBar';
import './App.css';
import ChatRoomPage from './ChatRoomPage';


function App({ location, history }) {
  const [roomState, updateRoomState] = useState(JSON.parse(localStorage.getItem("room-state-cache")));
  useEffect(() => {
    var currentPath = location.pathname.replace("/u/", "");
    while (currentPath.includes("/")) currentPath = currentPath.replace("/", "");
    // check current page if int or by current size
    console.log("current Path", currentPath);
    // two cases room stat is not empty and empty
    // by cache
    // by curent url
    if (roomState && roomState.chatRoomName) {
      // we have cache
      if (currentPath === 'chatroom') {
        // current path is chat room
        // set cache if empty
        console.log("do nothing");
      }
      else {
        // check if we have a match redirect to /chatroom/
        // else clear cache and keep current url
        if (roomState.chatRoomId === currentPath || roomState.secureUrl === currentPath) {
          localStorage.setItem("room-state-cache", JSON.stringify(roomState));
          history.push('/chatroom/');
        }
        else {
          updateRoomState(null);
          localStorage.removeItem("room-state-cache");
        }
      }
    }
    else {
      // we do not have cache
      if (currentPath === 'chatroom') {
        // current path is chat room
        // w need to go to home 
        console.log("no need to be here go home");
        history.push('/');
      }
    }
  }, [roomState, location.pathname, history]);
  return (
    <div className="App">
      {(!roomState && location.pathname === '/chatroom/') ? <Redirect to={'/'} /> : null}
      <TopBar />
      <Switch>
        <Route
          path="/chatroom/"
          exact
          render={(props) => <ChatRoomPage {...props} roomState={roomState || {}} />}
        />
        <Route path="/:chatRoomId"
          exact
          render={(props) => roomState ? null : <HomePage {...props} updateRoomState={updateRoomState} />}
        />
        <Route path="/u/:secureUrl"
          exact
          render={(props) => roomState ? null : <HomePage {...props} updateRoomState={updateRoomState} />}
        />
      </Switch>
    </div>
  );
}

const AppRoutes = withRouter(App);
const AppWithRouter = ({ roomStateCache }) => {
  return (
    <Router>
      <AppRoutes roomStateCache={roomStateCache} />
    </Router>
  )

}
export default AppWithRouter;
