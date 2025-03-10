/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server
	private onlineUsers = new Map<string, string>() //Map<userId,socketId>

	handleConnection(client: Socket) {
		const userId = client.handshake.query.userId as string
		if (userId) {
			this.onlineUsers.set(userId, client.id)
			this.server.emit('userOnline', userId)
		}
	}

	handleDisconnect(client: Socket) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const userId = [...this.onlineUsers.entries()].find(
			([_, socketId]) => socketId === client.id
		)?.[0]
		if (userId) {
			this.onlineUsers.delete(userId)
			this.server.emit('userOffline', userId)
		}
	}

	@SubscribeMessage('sendMessage')
	handleSendMessage(
		client: Socket,
		payload: { receiverId: string; message: string }
	) {
		const receiverSocket = this.onlineUsers.get(payload.receiverId)
		if (receiverSocket) {
			this.server.to(receiverSocket).emit('newMessage', payload)
		}
	}
}
