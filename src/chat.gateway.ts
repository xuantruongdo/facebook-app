import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: '*' })
export class ChatGateWay {
  @WebSocketServer()
  server;

  private onlineUsers: Set<string> = new Set();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;

    if (userId) {

      //@ts-ignore
      this.onlineUsers.add(userId);
      this.notifyOnlineUsers();
    }
  }

  handleDisconnect(client: Socket) {

    // Remove user from onlineUsers
    const userId = client.handshake.query.userId;
    if (userId) {
        //@ts-ignore
      this.onlineUsers.delete(userId);
      this.notifyOnlineUsers();
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(client: Socket) {
    // Send the list of online users to the client upon request
    this.notifyOnlineUsers(client);
  }

  private notifyOnlineUsers(client?: Socket, id?: string) {
    const usersArray = Array.from(this.onlineUsers);
    if (client && id) {
      client.emit('onlineUsers', usersArray);
    } else {
      this.server.emit('onlineUsers', usersArray);
    }
  }
  
  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() message: any): void {
  //   this.server.emit(`message`, message);
  // }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: any, room: string): void {
     client.leaveAll();
    client.join(room);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: any, payload: { room: string, message: string }): void {
    this.server.to(payload.room).emit('newMessage', payload.message);
  }

  @SubscribeMessage('like')
  handleLike(@MessageBody() data: any): void { 
    const {sender, post, type, createdAt} = data;
  
    // Thêm thông báo
    const notification = {
      sender: sender,
      message: `${sender?.name} liked your post!`,
      post: post,
      type: type,
      createdAt: createdAt
    };

    this.server.emit(`noti_${post?.author?._id}`, notification);
  }

  @SubscribeMessage('comment')
  handleComment(@MessageBody() data: any): void {
    const {sender, post, type, createdAt} = data;
  
    // Thêm thông báo
    const notification = {
      sender: sender,
      message: `${sender?.name} commented your post!`,
      post: post,
      type: type,
      createdAt: createdAt
    };

    this.server.emit(`noti_${post?.author?._id}`, notification);
  }

  @SubscribeMessage('follow')
  handleFollow(@MessageBody() data: any): void {
    const {sender, post, type, createdAt} = data;
  
    // Thêm thông báo
    const notification = {
      sender: sender,
      message: `${sender?.name} followed you!`,
      post: post,
      type: type,
      createdAt: createdAt
    };

    this.server.emit(`noti_${post?.author?._id}`, notification);
  }
}
