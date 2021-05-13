const APIURL = 'https://stark-mesa-34467.herokuapp.com';
const axios = require('axios');

export const getChatRooms = () => axios.get(`${APIURL}/chatroom/chatrooms`);

export const getChatRoomMessages = (chatRoomName) =>
  axios.get(`${APIURL}/chatroom/chatroom/messages/${chatRoomName}`);

export const joinRoom = (room) =>
  axios.post(`${APIURL}/chatroom/chatroom`, { room });

export const getChatRoomName = async (chatRoomId) => {
  const roomName = await axios.get(`${APIURL}/chatroom/${chatRoomId}`);
  return roomName.data;
};

export const deleteMsg = (chatRoomName, id) => {
  axios({
    method: 'post',
    url: `${APIURL}/chatroom/chatroom/messages/delete`,

    data: {
      chatRoomName,
      id,
    },
  });

  console.log('ddd');
};
