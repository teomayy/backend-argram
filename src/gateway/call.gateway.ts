/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common'
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PrismaService } from 'src/prisma.service'

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private prisma: PrismaService) {}

	@WebSocketServer() server: Server
	private activeCalls = new Map<string, string>() //Map<callerId, receiverId>
	private onlineUsers = new Map<string, string>() // Map<userId, socketId>

	private readonly logger = new Logger(CallGateway.name)

	handleConnection(client: Socket) {
		const userId = client.handshake.query.userId as string
		if (userId) {
			this.onlineUsers.set(userId, client.id)
			this.logger.log(`User connected: ${userId}`)
			this.server.emit('userOnline', userId)
		}
	}

	handleDisconnect(client: Socket) {
		const userId = [...this.onlineUsers.entries()].find(
			([_, socketId]) => socketId === client.id
		)?.[0]
		if (userId) {
			this.onlineUsers.delete(userId)
			this.logger.log(`User disconnected: ${userId}`)
			this.server.emit('userOffline', userId)
		}
	}

	@SubscribeMessage('callUser')
	async handleCallUser(
		client: Socket,
		payload: { callerId: string; receiverId: string; signalData: any }
	) {
		const receiverSocket = this.onlineUsers.get(payload.receiverId)
		if (receiverSocket) {
			this.activeCalls.set(payload.callerId, payload.receiverId)
			this.server.to(receiverSocket).emit('incomingCall', {
				callerId: payload.callerId,
				signalData: payload.signalData
			})

			// Сохраняем начало звонка в базе
			await this.prisma.call.create({
				data: {
					callerId: payload.callerId,
					receiverId: payload.receiverId
				}
			})
		}
	}

	@SubscribeMessage('answerCall')
	handleAnswerCall(
		client: Socket,
		payload: { callerId: string; signalData: any }
	) {
		const callerSocket = this.onlineUsers.get(payload.callerId)
		if (callerSocket) {
			this.server
				.to(callerSocket)
				.emit('callAccepted', { signalData: payload.signalData })
		}
	}

	@SubscribeMessage('endCall')
	async handleEndCall(
		client: Socket,
		payload: { callerId: string; receiverId: string }
	) {
		const callerSocket = this.onlineUsers.get(payload.callerId)
		const receiverSocket = this.onlineUsers.get(payload.receiverId)

		if (callerSocket) this.server.to(callerSocket).emit('callEnded')
		if (receiverSocket) this.server.to(receiverSocket).emit('callEnded')

		this.activeCalls.delete(payload.callerId)

		// Сохраняем завершение звонка
		await this.prisma.call.updateMany({
			where: {
				callerId: payload.callerId,
				receiverId: payload.receiverId,
				endedAt: null
			},
			data: {
				endedAt: new Date()
			}
		})
	}
}
