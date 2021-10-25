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


import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';



import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';

import logo from './logo.png';

import styled from 'styled-components';
import { StylesProvider } from '@material-ui/core/styles';



const drawerWidth = '250px';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex'
    },
    appBar: {
        /*     zIndex: theme.zIndex.drawer + 1,
         */ background: 'white',
        color: 'black'
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: 40,
        flexShrink: 0,
      },
    },
    drawerPaper: {
        width: drawerWidth,
        background: '#fff',
        color: '#000',
        padding: '20px 20px 60px'
    },
    drawerContainer: {
        overflow: 'auto',
    },

    content: {
        flexGrow: 1,
        padding: theme.spacing(3)
    },
    backColor: {
        backgroundColor: '#1ed788'
    },
    icon: {
        backgroundColor: '#fa5e02',
        borderRadius: '25px',
        color: 'white',
        height: '45px',
        width: '45px'
    }
}));
const SOCKET_IO_URL = 'https://stark-mesa-34467.herokuapp.com';
const socket = io(SOCKET_IO_URL);
/*const getChatData = () => {
  return JSON.parse(this.state.handle, this.state.chatRoomName);
};*/
const schema = yup.object({
    message: yup.string().required('Message is required')
});

function ChatRoomPage(props) {
    //console.log("ChatRoomPage.js");
    //console.log("lenght", props.roomState.charactersLimit);
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
    const handleFormChange = (evt) => {
        console.log('event', evt);
        //evt.target.value = evt.target.value.substr(0,10);
    };

    const handleThreadSubmit = async (evt, { resetForm }) => {
        console.log(evt);
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
        resetForm();
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
            user: props.roomState.handle
        });

        socket.on('userConnect', (data) => {
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
        const response = await getChatRoomMessages(props.roomState.chatRoomName);
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
                if (objDiv) objDiv.scrollTop = objDiv.scrollHeight + 300;
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
            setShow(threadId);
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
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatRoomName: props.roomState.chatRoomName,
                    id: messages[i].id,
                    reactions: JSON.stringify(obj)
                })
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
                {/* <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      > */}
                <AppBar position='fixed' className={classes.appBar}>
                    <Toolbar>
                        <img alt='logo' src={logo} width='30' height='30' className='d-inline-block align-top' />{' '}
                        <Typography variant='h5' style={{ marginLeft: '20px' }} noWrap>
                            OpenHuddle
                        </Typography>
                    </Toolbar>
                </AppBar>
                <HideDrawer>
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        display: 'block',
                        '& .MuiDrawer-paper': {
                            width: 100,
                            boxSizing: 'border-box'
                        }
                    }}
                    variant='permanent'
                    anchor='left'
                    className='menu'

                >
                    <Toolbar>
                        <img alt='logo' src={logo} width='30' height='30' className='d-inline-block align-top' />
                        <Typography variant='h5' style={{ marginLeft: '20px' }} noWrap>
                            OpenHuddle
                        </Typography>
                    </Toolbar>
                    <Divider />
                    <Chair>
                        <ChairTitle>Chair</ChairTitle>
                        <ChairAvatar>LP</ChairAvatar>

                        <ChairName>Lawrie Phipps</ChairName>
                    </Chair>
                    <Divider />

                    {/*   <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        > */}
                                                <UserTitle>Users</UserTitle>

                    <div className={classes.drawerContainer}>
                        {/*  <List>
              <h3>
                <i className="fas fa-comments"></i> Chair:
              </h3>
              <ListItem>
                <HuddleName id="room-name">Lawrie Phipps</HuddleName>
              </ListItem>
            </List> */}

                        <List>
                            {distinct.map((m, index) => {
                                return m ? (
                                    <UserList key={index}>
                                        {isUserOnline(m) ? (
                                            <>
                                                <OnlineUser>
                                                    <OnlineAvatar>{m.charAt(0)}</OnlineAvatar>
                                                    <OnlineName>{m}</OnlineName>
                                                </OnlineUser>
              
                                            </>
                                        ) : (
                                            <OfflineUser>
                                                    <OfflineAvatar>{m.charAt(0)}</OfflineAvatar>
                                                    <OfflineName>
                                                    {m}
                                                </OfflineName>
                                            </OfflineUser>
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
                                    </UserList>
                                ) : null;
                            })}
                        </List>
                    </div>
                </Drawer>
                </HideDrawer>
                <WelcomeBar>
                <WelcomeHeader>Welcome to the Huddle {props.roomState.handle}</WelcomeHeader>
                <WelcomeBody>Todays Huddle Title is: {props.roomState.chatRoomName}{' '} </WelcomeBody>
            </WelcomeBar>
            <div className="chat-room-page">
          <div className="row">
            <div className="chat-messages" id="allmsg">
              {messages
                .filter((m) => m.threadId === null)
                .map((m, i) => {
                  return (
                    <div
                      className="message bubble-bottom-left"
                      style={{
                        minHeight: '150px',
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
                            <IconButton
                            color="warning"
                              onClick={async () => {
                                deleteMsg(props.roomState.chatRoomName, m.id);
                                setTimeout(() => {
                                  getMessages();
                                }, 1000);
                              }}
                            >
                              <DeleteIcon/>
                            </IconButton>
                          ) : null}
                         
                        </ButtonWrapper>
                      </MessageHeader>

                      <div className='message-row' style={{ position: 'relative'}}>
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
                          <Replies onClick={() => {handleReplyButton(m.id); setViewThreadId(m.id);
                            setShowReply(!showReply);
                            setShow(showReply ? null : m.id);
                          }}>
                            {getNumberOfReplies(m.id)}
                          </Replies>
                        )}
                         {messages.filter((thread) => thread.threadId === m.id)
                        .length <= 0 && (
                      <ViewThread
                            onClick={() => {
                              setViewThreadId(m.id);
                              setShowReply(!showReply);
                              setShow(showReply ? null : m.id);
                            }}
                          >
                            Reply to message
                          </ViewThread>
                                                  )}

                      {messages
                        .filter((thread) => thread.threadId === m.id)
                        .map((m, i) => {
                          return (
                            <>
                              {show === m.threadId ? (
                                <>
                                  <div key={i} className="thread">
                                    <div className="row thread-row">
                                      <ThreadAvatar>{m.author.charAt(0)}</ThreadAvatar>
                                      <div className="thread-author"> {m.author}</div>
                                      <div className="thread-date"><Moment format="MMMM Do YYYY, h:mm:ss a">{m.createdAt}</Moment></div>
                                      {props.roomState.handle === m.author ? (
                            <IconButton
                              className='delete-thread'
                              onClick={async () => {
                                deleteMsg(props.roomState.chatRoomName, m.id);
                                setTimeout(() => {
                                  getMessages();
                                }, 1000);
                              }}
                            >
                              <DeleteIcon/>
                            </IconButton>
                          ) : null}
                                    </div>
                                    <div className="thread-text">
                                      {m.message}
                                    </div>
                                    
                          <div className='thread-emoji-row'>
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
                                placeholder="Reply to this message.."
                                value={values.message ? (props.roomState.charactersLimit ? values.message.substr(0,props.roomState.charactersLimit): values.message) : ''}
                                onChange={handleChange}
                                error={touched.message && errors.message}
                              />
                          
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
            onChange={handleFormChange}
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
                  value={values.message ? (props.roomState.charactersLimit ? values.message.substr(0,props.roomState.charactersLimit): values.message) : ''}
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

                <StyledSubmit
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
                </StyledSubmit>
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
/* const StyledSideBar = styled(Drawer)`
    background: var(--dark-color-b);
    color: #fff;
    padding: 20px 20px 60px;
    overflow-y: scroll;
    width: 20%;
    height: 100%;
    position: absolute;
`; */

const OnlineUser = styled(ListItem)`
    color: #fff;
    background: #4eb8fe;
    height: 70px;
    width: 100%;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
`;

const OnlineName = styled(ListItemIcon)`
    color: #fff;
    text-align: center;
    padding: 20px;
`;

const UserList = styled(ListItem)`
    padding-left: 0px;
`;

const OfflineUser = styled(ListItem)`
    color: #000;
    height: 70px;
    width: 100%;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    opacity:0.5;
`;

const OfflineName = styled(ListItemIcon)`
    color: #000;
    text-align: center;
    padding: 20px;
    

`;

/* const HuddleName = styled.div`
    font-size: 1.5em;
    background: rgba(0, 0, 0, 0.1);
    padding: 10px;
    margin-bottom: 20px;
`; */

const StyledInput = styled(TextField)`
    width: 80%;
    margin-top: 15px;
    border-radius: 20px;
    margin-left: 25px;
    margin-bottom: 30px;
    position: relative;
`;

const ViewThread = styled(Button)`
    background-color: #fff;
    color: #408fb5;
    margin-left: 23px;
    margin-bottom: 10px;
`;

/* const DeleteButton = styled(Button)`
    background-color: #fa5e02;
    color: #fff;
    margin-right: 20px;
`; */

/* const DeleteButtonThread = styled(Button)`
    background-color: #fa5e02;
    color: #fff;
    float: right;
    right: -250px;
`; */
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
    @media (max-width: 768px) {
      margin-right: 10px;
  }
`;

const PickerWrapper = styled.div`
    right: 20px;
    position: absolute;
    bottom: calc(100% - -10px);
`;

const ButtonWrapper = styled.div``;

const MessageHeader = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Chair = styled(Toolbar)`
    height: 75%;
    background-color: #fafafa;
    display: block;
    
`;

const ChairTitle = styled(Typography)`
    font-family: roboto;
    text-align: center;
    font-weight: 400;
    font-size: 1.75em;
    margin-top: 20px;
`;

const UserTitle = styled(Typography)`
    font-family: roboto;
    margin-left: 20px;
    font-weight: 400;
    font-size: 1.5em;
    margin-top: 20px;
    margin-bottom: 10px;
`;

const ChairName = styled(Typography)`
    font-family: roboto;
    text-align: center;
    font-size: 1.2em;
    margin-top: 10px;
`;

const ChairAvatar = styled(Avatar)`
    margin-left: 34%;
    padding: 34px;
    margin-top: 10px;
`;

const OnlineAvatar = styled(Avatar)`
    background-color: #fff;
    color: green;
`;

const OfflineAvatar = styled(Avatar)`
    color: red;

`;

const WelcomeBar = styled(Toolbar)`
    background-color: #12ba8e;
    color: #fff;
    padding: 5px;
    margin-top: 10px;
    display:block;
`;

const WelcomeHeader = styled(Typography)`
    color: #fff;
    text-align:center;
    font-weight: 400;
    font-size: 1.75em;
`;

const WelcomeBody = styled(Typography)`
    color: #fff;
    text-align:center;
    margin-bottom:10px;
`;


/* const ChatMessage = styled.div`
  
  padding: 30px;
  max-height: 65vh;
  overflow-y: scroll;

`; */

const Replies = styled(Button)`
    background-color: #fff;
    color: #408fb5;
    margin-left: 23px;
    margin-bottom: 10px;
`;

const ThreadAvatar = styled(Avatar)`
    padding:10px;
    margin-left: 25px;
`;



const HideDrawer = styled.div`
  @media (max-width: 768px) {
    display:none;
  }

`;


const StyledSubmit = styled(Button)`
  @media (max-width: 768px) {
    display:none;
  }

`;

