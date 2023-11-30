const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(socket.user, "Connected");
    socket.join(socket.user);
    
  /****************************For chat */
  socket.on("chatSend", (data) => {
    let senderID = socket.user;
    let receiverID = data.receiverID;
    let senderType=data.senderType;
    let chatMessage = data.chatMessage;
  // console.log("chat Initialize");
  //   console.log("receiver here-> " + receiverID);
  //     console.log("message-> " + chatMessage);
    socket.to(receiverID).emit("chatReceived", {
      chatMessage,
      senderID,
      receiverID,
      senderType
    });
  });
  /****************************End chat */
    
    socket.on("call", (data) => {
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      // console.log(data, "Call");
      // console.log("rtcMessage",rtcMessage );
      
      socket.to(calleeId).emit("newCall", {
        callerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      rtcMessage = data.rtcMessage;

      // console.log("answerCall" );
      // console.log("rtcMessage",rtcMessage );
      socket.to(callerId).emit("callAnswered", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("endCall", (data) => {
      let callerId = data.callerId;
      rtcMessage = data.callEnd;
      // console.log(callerId);
      // console.log("?????????????????");
      socket.to(callerId).emit("callEnd", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("ICEcandidate", (data) => {
     // console.log("ICEcandidate data.calleeId", data.calleeId);
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      // console.log("socket.user emit", socket.user);
      // console.log("socket.user emit", rtcMessage);
      socket.to(calleeId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error("IO not initilized.");
  } else {
    return IO;
  }
};