import React from 'react';
import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import Button from '@material-ui/core/Button';
import * as yup from 'yup';
import io from 'socket.io-client';
import './ChatRoomPage.css';
import { getChatRoomMessages, getChatRooms, deleteMsg } from './requests';
import TextField from '@material-ui/core/TextField';
import KeyboardArrowRightRoundedIcon from '@material-ui/icons/KeyboardArrowRightRounded';
// import { Picker } from "emoji-mart";
import Picker from 'emoji-picker-react';
import Moment from 'react-moment';


import { JiscBoombox } from 'jisc-innovation-mui-components';

import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';

import logo from './logo.png';

import styled from 'styled-components';
import { StylesProvider } from '@material-ui/core/styles';

const drawerWidth = '20%';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    background: 'white',
    color: 'black',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    background: '#166797',
    color: 'white',
    padding: '20px 20px 60px',
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  icon: {
    backgroundColor: '#fa5e02',
    borderRadius: '25px',
    color: 'white',
    height: '45px',
    width: '45px',
  },
}));

const SOCKET_IO_URL = 'https://stark-mesa-34467.herokuapp.com';
const socket = io(SOCKET_IO_URL);
/*const getChatData = () => {
  return JSON.parse(this.state.handle, this.state.chatRoomName);
};*/
const schema = yup.object({
  message: yup.string().required('Message is required'),
});

function ChatRoomPage(props) {
  console.log("ChatRoomPage.js");

  const classes = useStyles();

  const [viewThreadId, setViewThreadId] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  // eslint-disable-next-line
  const [rooms, setRooms] = useState([]);
  const handleSubmit = async (evt, { resetForm }) => {
    const isValid = await schema.validate(evt);
    if (!isValid) {
      return;
    }
    const data = Object.assign({}, evt);
    data.chatRoomName = props.roomState.chatRoomName;
    data.author = props.roomState.handle;
    data.message = evt.message;
    socket.emit('message', data);
    resetForm();
  };

  const handleThreadSubmit = async (evt) => {
    const isValid = await schema.validate(evt);
    if (!isValid) {
      return;
    }
    const data = Object.assign({}, evt);
    data.chatRoomName = props.roomState.chatRoomName;
    data.threadId = viewThreadId;
    data.author = props.roomState.handle;
    data.message = evt.message;
    socket.emit('message', data);
    evt.target.reset();
  };

  const [onlineUsers, setOnlineUsers] = useState({});
  const connectToRoom = () => {
    socket.on('connect', (data) => {
      socket.emit('join', props.roomState.chatRoomName);
    });
    socket.on('newMessage', (data) => {
      getMessages(true);
    });

    socket.emit('login', {
      room: props.roomState.chatRoomName,
      user: props.roomState.handle,
    });

    socket.on('userConnect', data => {
      setOnlineUsers(data);
    });

    setInitialized(true);
  };
  const [distinct, setDistinct] = useState([]);


  useEffect(() => {
    // eslint-disable-next-line
    for (const [key, { room, user }] of Object.entries(onlineUsers)) {
      if (distinct.indexOf(user) < 0) {
        setDistinct((prev) => {
          return [...prev, user];
        });
      }
    }
  }, [onlineUsers, distinct]);

  const isUserOnline = (u) => {
    // eslint-disable-next-line
    for (const [key, { room, user }] of Object.entries(onlineUsers)) {
      if (user === u && room === props.roomState.chatRoomName) {
        return true;
      }
    }
  };

  const getMessages = async (scroll) => {
    const response = await getChatRoomMessages(
      props.roomState.chatRoomName
    );
    //console.log(response.data);
    setMessages(response.data);
    const dis = [];
    // eslint-disable-next-line
    response.data.map((m) => {
      if (dis.indexOf(m.author) === -1) {
        dis.push(m.author);
      }
      // array-callback-return
    });
    setDistinct(dis);

    setInitialized(true);
    if (scroll) {
      setTimeout(() => {
        var objDiv = document.getElementById('allmsg');
        if(objDiv) objDiv.scrollTop = objDiv.scrollHeight + 300;
      }, 200);
    }
  };

  const getRooms = async () => {
    const response = await getChatRooms();
    setRooms(response.data);
    setInitialized(true);
  };
  useEffect(() => {
    if (!initialized) {
      getMessages(true);
      connectToRoom();
      getRooms();
    }
    // eslint-disable-next-line
  }, []);

  const [show, setShow] = useState(null);

  const [showReply, setShowReply] = useState(false);

  const handleReplyButton = (threadId) => {
    // viewThreadId === m.id  ? setShow(m.id) : setShow(null)

    if (threadId === show) {
      setShow(null);
    } else {
      setShow(threadId);
    }
  };

  const [showEmojis, setShowEmojis] = useState(false);
  const [showReactionBox, setShowReactionBox] = useState(false);
  const [currentMsgId, setCurrentMsgId] = useState(undefined);

  const getNumberOfReplies = (id) => {
    let num = 0;
    messages
      .filter((thread) => thread.threadId === id)
      // eslint-disable-next-line
      .map((m, i) => {
        num++;
      });

    return `Show ${num} replies`;
  };

  const emjoiReact = (id, rec) => {
    let i;
    messages.forEach((obj, index) => {
      if (obj.id === id) {
        i = index;
      }
    });
    console.log(i);
    const APIURL = 'https://stark-mesa-34467.herokuapp.com';
    const update = (obj) => {
      fetch(`${APIURL}/chatroom/chatroom/messages/reaction`, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomName: props.roomState.chatRoomName,
          id: messages[i].id,
          reactions: JSON.stringify(obj),
        }),
      })
        .then((response) => response.json())
        .then(() => {
          getMessages();
          setShowReactionBox(false);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    };
    if (!messages[i].reactions) {
      const obj = {};
      obj[rec] = 1;
      update(obj);
    } else {
      const obj = JSON.parse(messages[i].reactions);
      if (obj[rec]) {
        obj[rec] = obj[rec] + 1;
      } else {
        obj[rec] = 1;
      }
      update(obj);
    }
  };

  const getEmojiFromNmae = (obj) => {
    let allEmojis = ['like', 'heart', 'blush', 'smile', 'clap'];
    let list = [];
    for (let i = 0; i < 5; i++) {
      if (obj[allEmojis[i]]) {
        if (i === 0) {
          list.push({
            e: '👍',
            num: obj[allEmojis[i]]
          });
        }

        if (i === 1) {
          list.push({
            e: '👎',
            num: obj[allEmojis[i]]
          });
        }

        if (i === 2) {
          list.push({
            e: '😍',
            num: obj[allEmojis[i]]
          });
        }

        if (i === 3) {
          list.push({
            e: '🤣',
            num: obj[allEmojis[i]]
          });
        }

        if (i === 4) {
          list.push({
            e: '👏',
            num: obj[allEmojis[i]]
          });
        }
      }
    }

    return list;
  };
  return (
    <>
      <StylesProvider injectFirst>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <img
              alt="logo"
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            <Typography variant="h5" style={{ marginLeft: '20px' }} noWrap>
              OpenHuddle
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <List>
              <h3>
                <i className="fas fa-comments"></i> Chair:
              </h3>
              <ListItem>
                <HuddleName id="room-name">James Hodgkinson</HuddleName>
              </ListItem>
            </List>
            <Divider />
            <List>
              <h3>
                <i className="fas fa-users"></i> Users:
              </h3>
              {distinct.map((m, index) => {
                return m ? (
                  <ListItem key={index}>
                    {isUserOnline(m) ? (
                      <>
                        <Name>{m}</Name>
                        <div className="online-user"></div>
                      </>
                    ) : (
                      <Name>{m}</Name>
                    )}

                    {/* {Object.keys(onlineUsers).map((key, i) => {
                      const { name, room } = onlineUsers[key];
                      console.log(name);
                      return (
                        <>
                          <Name>{onlineUsers[key].name}</Name>
                          <div className="online-user"></div>
                        </>
                      );
                    })} */}
                  </ListItem>
                ) : null;
              })}
            </List>
          </div>
        </Drawer>
        <JiscBoombox padding="xs">
          <Typography variant="h3">
            Welcome to the Huddle {props.roomState.handle}
          </Typography>
          <br></br>
          <Typography variant="h4">
            Todays Huddle Title is: {props.roomState.chatRoomName}{' '}
          </Typography>
        </JiscBoombox>

        <div className="chat-room-page">
          <div className="row">
            <div className="chat-messages" id="allmsg">
              {messages
                .filter((m) => m.threadId === null)
                .map((m, i) => {
                  return (
                    <div
                      className="message"
                      style={{
                        minHeight: '120px',
                      }}
                      key={i}
                    >
                      <MessageHeader>
                        <div className="message-head">
                          <div className='author'>{m.author}</div>
                          <div className='date'><Moment format="MMMM Do YYYY, h:mm:ss a">{m.createdAt}</Moment></div>
                        </div>

                        <ButtonWrapper>
                          {props.roomState.handle === m.author ? (
                            <DeleteButton
                              onClick={async () => {
                                deleteMsg(props.roomState.chatRoomName, m.id);
                                setTimeout(() => {
                                  getMessages();
                                }, 1000);
                              }}
                            >
                              Delete
                            </DeleteButton>
                          ) : null}
                          <ViewThread
                            onClick={() => {
                              setViewThreadId(m.id);
                              setShowReply(!showReply);
                              setShow(showReply ? null : m.id);
                            }}
                          >
                            Reply to message
                          </ViewThread>
                        </ButtonWrapper>
                      </MessageHeader>

                      <div className='row' style={{ position: 'relative' }}>
                        <div className='message-text'>{m.message}</div>
                        <div className='react-ct'>
                          <div className='counter-ct'>
                            {m.reactions
                              ? m.reactions[0] === '{'
                                ? getEmojiFromNmae(JSON.parse(m.reactions)).map(
                                  ({ e, num }, index) => {
                                    return <div key={index}>{`${e} ${num}`}</div>;
                                  }
                                )
                                : ''
                              : ''}
                          </div>
                          <EmojiEmotionsIcon
                            onClick={() => {
                              setShowReactionBox(!showReactionBox);
                              setCurrentMsgId(m.id);
                            }}
                          />
                          +
                          {showReactionBox && currentMsgId === m.id ? (
                            <div className="reaction-box">
                              <button
                                onClick={() => {
                                  emjoiReact(m.id, 'like');
                                }}
                              >
                                👍
                              </button>

                              <button
                                onClick={() => {
                                  emjoiReact(m.id, 'heart');
                                }}
                              >
                                👎
                              </button>
                              <button
                                onClick={() => {
                                  emjoiReact(m.id, 'blush');
                                }}
                              >
                                😍
                              </button>
                              <button
                                onClick={() => {
                                  emjoiReact(m.id, 'smile');
                                }}
                              >
                                🤣
                              </button>
                              <button
                                onClick={() => {
                                  emjoiReact(m.id, 'clap');
                                }}
                              >
                                👏
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="row"></div>
                      {messages.filter((thread) => thread.threadId === m.id)
                        .length > 0 && (
                          <Button onClick={() => handleReplyButton(m.id)}>
                            {getNumberOfReplies(m.id)}
                          </Button>
                        )}

                      {messages
                        .filter((thread) => thread.threadId === m.id)
                        .map((m, i) => {
                          return (
                            <>
                              {show === m.threadId ? (
                                <>
                                  <div key={i} className="thread">
                                    <div className="row">
                                      <div className="author">{m.author}</div>
                                      <div className="date">{m.createdAt}</div>
                                    </div>
                                    <div className="thread-text">
                                      {m.message}
                                    </div>
                                  </div>
                                </>
                              ) : null}
                            </>
                          );
                        })}
                      {showReply && m.id === viewThreadId ? (
                        <Formik
                          initialValues={{}}
                          validationSchema={schema}
                          onSubmit={handleThreadSubmit}
                        >
                          {({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isInvalid,
                            errors,
                          }) => (
                            <form
                              className="styled-input"
                              noValidate
                              onSubmit={handleSubmit}
                            >
                              <StyledInput
                                InputProps={{ disableUnderline: true }}
                                type="text"
                                name="message"
                                placeholder="Relpy to this message.."
                                value={values.message || ''}
                                onChange={handleChange}
                                error={touched.message && errors.message}
                              />
                              <Button type="submit" style={{ float: 'right' }}>
                                <KeyboardArrowRightRoundedIcon
                                  className={classes.icon}
                                ></KeyboardArrowRightRoundedIcon>
                              </Button>
                            </form>
                          )}
                        </Formik>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          </div>
          <Formik
            initialValues={{}}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              isInvalid,
              errors,
              setFieldValue,
            }) => (
              <form
                className="styled-input"
                noValidate
                onSubmit={handleSubmit}
                style={{ position: 'relative' }}
              >
                <StyledInput
                  InputProps={{ disableUnderline: true }}
                  type="text"
                  name="message"
                  placeholder="Type something here.."
                  value={values.message || ''}
                  onChange={handleChange}
                  error={touched.message && errors.message}
                />
                <StyledEmojiReact
                  onClick={() => {
                    setShowEmojis(!showEmojis);
                  }}
                />
                {showEmojis && (
                  <PickerWrapper>
                    <StyledPicker
                      onEmojiClick={(e, obj) => {
                        setFieldValue(
                          'message',
                          values.message
                            ? values.message + obj.emoji
                            : '' + obj.emoji
                        );
                      }}
                    ></StyledPicker>
                  </PickerWrapper>
                )}

                <Button
                  type="submit"
                  style={{
                    float: 'right',
                    position: 'absolute',
                    top: '3px',
                    right: '10px',
                  }}
                >
                  <KeyboardArrowRightRoundedIcon
                    className={classes.icon}
                  ></KeyboardArrowRightRoundedIcon>
                </Button>
              </form>
            )}
          </Formik>
        </div>
      </StylesProvider>
    </>
  );
}
export default ChatRoomPage;

// eslint-disable-next-line
const StyledSideBar = styled(Drawer)`
  background: var(--dark-color-b);
  color: #fff;
  padding: 20px 20px 60px;
  overflow-y: scroll;
  width: 20%;
  height: 100%;
  position: absolute;
`;

const Name = styled(ListItemIcon)`
  color: #fff;
`;

const HuddleName = styled.div`
  font-size: 20px;
  background: rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin-bottom: 20px;
`;

const StyledInput = styled(TextField)`
  width: 80%;
  margin-top: 15px;
  border-radius: 20px;
  margin-left: 25px;
  margin-bottom: 30px;
  position: relative;
`;

const ViewThread = styled(Button)`
   background-color: #fa5e02;
    color: #fff;
`;

const DeleteButton = styled(Button)`
   background-color: #fa5e02;
    color: #fff;
    margin-right: 20px;
`;
const StyledPicker = styled(Picker)`
  right: 20px;
  position: absolute;
`;

const StyledEmojiReact = styled(EmojiEmotionsIcon)`
    fill: #166797;
    margin-top: 18px;
    cursor: pointer;
    float: right;
    margin-right: 80px;
`;

const PickerWrapper = styled.div`
    right: 20px;
    position: absolute;
    bottom: calc(100% - -10px);
`;

const ButtonWrapper = styled.div`
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;