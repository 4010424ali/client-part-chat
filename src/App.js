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
    let roomStateCache = JSON.parse(localStorage.getItem("room-state-cache"));
    var currentPath = location.pathname;
    while (currentPath.includes("/")) currentPath = currentPath.replace("/", "");
    if (roomState && roomState.handle && roomState.chatRoomName && roomStateCache === null) {
      localStorage.setItem("room-state-cache", JSON.stringify(roomState));
      history.push("/chatroom/");
    } else if (roomState && roomStateCache && roomStateCache.chatRoomName && parseInt(currentPath)) {
      if(parseInt(currentPath) !== parseInt(roomState.chatRoomId)){
        updateRoomState(null);
        localStorage.removeItem("room-state-cache");
        history.push(location.pathname);
      }
      else{
        history.push('/chatroom/');
      }      
    }
  }, [roomState,location.pathname, history]);
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
        </Switch>
    </div>
  );
}

const AppRoutes = withRouter(App);
const AppWithRouter = ({roomStateCache}) =>{
  return (
  <Router>
    <AppRoutes roomStateCache={roomStateCache}/>
  </Router>
  )
  
}
export default AppWithRouter;
