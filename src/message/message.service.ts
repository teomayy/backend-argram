import { Injectable } from '@nestjs/common'
import { FirebaseService } from 'src/firebase/firebase.service'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class MessageService {
	constructor(
		private prisma: PrismaService,
		private firebaseService: FirebaseService
	) {}

	async sendMessage(
		chatId: string,
		senderId: string,
		text: string,
		key: string
	) {
		const { id: firestoreId } = await this.firebaseService.saveMessage(
			chatId,
			senderId,
			text,
			key
		)

		return this.prisma.message.create({
			data: {
				chatId,
				senderId,
				encryptedText: text,
				encryptedKey: key,
				firestoreId
			}
		})
	}

	async getMessage(chatId: string) {
		return this.prisma.message.findMany({
			where: { chatId },
			orderBy: { createdAt: 'asc' }
		})
	}
}
