/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PrismaService } from 'src/prisma.service'

@WebSocketGateway(4501, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server
	private onlineUsers = new Map<string, string>() //Map<userId, socketId>

	constructor(private readonly prisma: PrismaService) {}

	handleConnection(client: Socket) {
		console.log(`✅ Подключен клиент: ${client.id}`)
		const userId = client.handshake.query.userId as string
		if (userId) {
			this.onlineUsers.set(userId, client.id)
			this.server.emit('userOnline', userId)
		}
	}

	handleDisconnect(client: Socket) {
		console.log(`❌ Отключен клиент: ${client.id}`)
		const userId = [...this.onlineUsers.entries()].find(
			([_, socketId]) => socketId === client.id
		)?.[0]
		if (userId) {
			this.onlineUsers.delete(userId)
			this.server.emit('userOffline', userId)
		}
	}

	@SubscribeMessage('sendMessage')
	async handleMessage(client: Socket, payload: any) {
		console.log(`📩 Получено сообщение:`, payload)

		// Если payload пришёл как строка — парсим JSON
		if (typeof payload === 'string') {
			try {
				payload = JSON.parse(payload)
			} catch (e) {
				console.error(`❌ Ошибка парсинга JSON`, payload)
				client.emit('error', { message: 'Ошибка формата данных' })
				return
			}
		}

		// Данные должны быть объектом, а не массивом
		if (typeof payload !== 'object' || payload === null) {
			console.error(`❌ Ошибка: payload не является объектом!`, payload)
			client.emit('error', { message: 'Некорректный формат данных' })
			return
		}

		const { senderId, chatId, message } = payload

		// Проверяем, что переданы все необходимые параметры
		if (!senderId || !chatId || !message) {
			console.error(`❌ Ошибка: отсутствуют необходимые данные!`, payload)
			client.emit('error', { message: 'Некорректные данные сообщения' })
			return
		}

		try {
			const sender = await this.prisma.user.findUnique({
				where: { id: senderId }
			})

			if (!sender) {
				console.error(`❌ Ошибка: Пользователь ${senderId} не найден!`)
				client.emit('error', { message: 'Пользователь не найден' })
				return
			}

			// 🔎 Проверяем, существует ли чат перед добавлением сообщения
			let chat = await this.prisma.chat.findUnique({
				where: { id: chatId }
			})

			if (!chat) {
				console.log(`ℹ️ Чат ${chatId} не найден, создаём новый`)
				chat = await this.prisma.chat.create({
					data: { id: chatId, isGroup: false }
				})
			}

			// Сохранение сообщения в БД
			const newMessage = await this.prisma.message.create({
				data: {
					chatId: chat.id,
					senderId: sender.id,
					encryptedText: message, // Пока не шифруем
					encryptedKey: '' // В будущем можно добавить шифрование
				}
			})

			// Отправка сообщения другим клиентам
			this.server.to(chatId).emit('newMessage', newMessage)
			console.log(`✅ Сообщение успешно отправлено`)
		} catch (error) {
			console.error(`❌ Ошибка сохранения сообщения в БД:`, error)
			client.emit('error', { message: 'Ошибка сохранения сообщения' })
		}
	}
}
