import React from 'react';
import { useState } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Redirect } from 'react-router';
import { joinRoom } from './requests';
import styled from 'styled-components';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import Button from '@material-ui/core/Button';
import { JiscBoombox } from 'jisc-innovation-mui-components';
import { getChatRoomName } from './requests';

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const schema = yup.object({
  handle: yup.string().required('Handle is required'),
  chatRoomName: yup.string().required('Chat room is required'),
});
function HomePage(props) {
  const [v, set] = useState('');
  const chatRoomId = props.match.params.chatRoomId;
  const classes = useStyles();

  const [redirect, setRedirect] = useState(false);
  const [chatRoomName, setChatRoomName] = useState({});
  // eslint-disable-next-line
  const [myEvt, setMyEvt] = useState({});
  const handleSubmit = async (evt) => {};
  if (redirect) {
    return (
      <Redirect
        to={{
          pathname: '/chatroom',
          state: { chatRoomName: chatRoomName, handle: v },
        }}
      />
    );
  }
  return (
    <>
      <JiscBoombox>
        <Typography variant="h3">Welcome to OpenHuddle</Typography>
        <br></br>
        <Typography variant="h4">
          Insert your name below and join the conversation{' '}
        </Typography>
      </JiscBoombox>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <HomeConatiner>
          <StyledAvatar>
            <LockOutlinedIcon />
          </StyledAvatar>
          <Typography component="h1" variant="h5">
            Insert your name below
          </Typography>
          <Formik
            validationSchema={schema}
            onSubmit={handleSubmit}
            initialValues={JSON.parse(localStorage.getItem('chatData') || '{}')}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              isinvalid,
              errors,
            }) => (
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Name"
                  type="text"
                  name="handle"
                  placeholder="Name"
                  value={v}
                  onChange={(e) => {
                    set(e.target.value);
                  }}
                  isInvalid={touched.handle && errors.handle}
                />
                {/*<TextField
                                    variant='outlined'
                                    margin='normal'
                                    required
                                    label='Chat Room Name'
                                    fullWidth
                                    type='text'
                                    name='chatRoomName'
                                    placeholder='Chat Room Name'
                                    value={values.chatRoomName || ''}
                                    onChange={handleChange}
                                    isInvalid={touched.chatRoomName && errors.chatRoomName}
                                />*/}
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={async (evt) => {
                    const tmpchatRoomName = await getChatRoomName(chatRoomId);
                    const tmpmyEvt = evt;

                    if (tmpchatRoomName != null && tmpmyEvt != null) {
                      //localStorage.setItem("chatData", JSON.stringify(evt));

                      await joinRoom(tmpchatRoomName);
                      setMyEvt(tmpmyEvt.handle);
                      setChatRoomName(tmpchatRoomName);
                      setRedirect(true);
                    }
                  }}
                >
                  Join the conversation
                </StyledButton>
              </form>
            )}
          </Formik>
        </HomeConatiner>
        <Box mt={8}></Box>
      </Container>
    </>
  );
}
export default HomePage;

const StyledButton = styled(Button)`
  background-color: #166797;
  border-radius: 0;
  &:hover {
    background-color: #e85f14;
  }
`;

const HomeConatiner = styled.div`
  margin-top: 0px;
  display: 'flex';
  flex-direction: 'column';
  text-align: center;
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
    0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
  padding: 60px;
`;

const StyledAvatar = styled(Avatar)`
  background-color: #e85f14;
  margin: auto;
  align-items: center;
`;
