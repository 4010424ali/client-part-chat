import React from 'react';
import { useState } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
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
import { getChatRoomInofsFromId, getChatRoomInofsFromSecureUrl } from './requests';

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
  console.log("HomePage.js");
  const [v, set] = useState('');
  const chatRoomId = props.match.params.chatRoomId;
  const secureUrl = props.match.params.secureUrl;
  const classes = useStyles();

  const [redirect, setRedirect] = useState(false);

  // eslint-disable-next-line
  const [myEvt, setMyEvt] = useState({});
  const handleSubmit = async (evt) => { };

  if (redirect) {
    return null;
  }
  else return (
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
              <form className={classes.form} noValidate
              autocomplete="off"  
              onSubmit={handleSubmit}>
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
                  error={touched.handle && errors.handle}
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
                    let tmpRoomId = '';
                    let tmpchatRoomName = '';
                    let rm = {};
                    if (secureUrl) {
                      rm = await getChatRoomInofsFromSecureUrl(secureUrl);
                      tmpRoomId = rm.id;
                      tmpchatRoomName = rm.name;
                    }
                    if (chatRoomId) {
                      rm = await getChatRoomInofsFromId(chatRoomId);
                      tmpRoomId = rm.id;
                      tmpchatRoomName = rm.name;
                    }
                    const tmpmyEvt = evt;
                    if (tmpchatRoomName != null && tmpmyEvt != null) {
                      //localStorage.setItem("chatData", JSON.stringify(evt));
                      await joinRoom(tmpchatRoomName);
                      setMyEvt(tmpmyEvt.handle);
                      setRedirect(true);
                      props.updateRoomState({ chatRoomName: tmpchatRoomName, handle: v, chatRoomId: tmpRoomId, secureUrl: rm.secureUrl, charactersLimit: rm.charactersLimit })
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
