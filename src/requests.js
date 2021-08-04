const APIURL = 'https://stark-mesa-34467.herokuapp.com';
//const APIURL = 'http://192.168.1.112:3000'
const axios = require('axios');

export const getChatRooms = () => axios.get(`${APIURL}/chatroom/chatrooms`);

export const getChatRoomMessages = (chatRoomName) =>
  axios.get(`${APIURL}/chatroom/chatroom/messages/${chatRoomName}`);
/*
export const getChatRoomMessages = (chatRoomName) => 
({data: JSON.parse(`[{"id":395,"chatRoomId":96,"author":"Ben","message":"Hello all","threadId":null,"reactions":{"like":1},"createdAt":"2021-06-11T12:50:52.207Z","updatedAt":"2021-06-11T12:51:00.547Z"}]`)})
*/
  

export const joinRoom = (room) =>
  axios.post(`${APIURL}/chatroom/chatroom`, { room });
/*
export const joinRoom = (room) =>
  ({data: JSON.parse(`[{"id":96,"name":"${room}","createdAt":"2021-06-11T12:50:35.936Z","updatedAt":"2021-06-11 12:50:35.936 +00:00"}]`)})
*/

export const getChatRoomName = async (chatRoomId) => {
  const roomName = await axios.get(`${APIURL}/chatroom/${chatRoomId}`);
  return roomName.data;
};
export const getChatRoomInofsFromSecureUrl = async (secureUrl) => {
  const room = await axios.get(`${APIURL}/chatroom/infos/url/${secureUrl}`);
  return room.data;
};
export const getChatRoomInofsFromId = async (id) => {
  const room = await axios.get(`${APIURL}/chatroom/infos/id/${id}`);
  return room.data;
};

/*
export const getChatRoomName = async (chatRoomId) => {
  return '91';
};
*/


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
