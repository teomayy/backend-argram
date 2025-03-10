import { Inject, Injectable } from '@nestjs/common'
import { app, storage } from 'firebase-admin'
import { v4 as uuid } from 'uuid'

@Injectable()
export class FirebaseService {
	#db: FirebaseFirestore.Firestore
	#messagesCollection: FirebaseFirestore.CollectionReference

	constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
		this.#db = firebaseApp.firestore()
		this.#messagesCollection = this.#db.collection('message')
	}

	async saveMessage(
		chatId: string,
		senderId: string,
		encryptedText: string,
		encryptedKey: string
	) {
		const docRef = await this.#messagesCollection.add({
			chatId,
			senderId,
			encryptedText,
			encryptedKey,
			createdAt: new Date()
		})
		return { id: docRef.id }
	}

	async uploadFile(file: Express.Multer.File) {
		const fileName = `${uuid()}-${file.originalname}`
		const fileRef = storage().bucket().file(fileName)

		await fileRef.save(file.buffer, {
			metadata: { contentType: file.mimetype }
		})

		return await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2030' })
	}
}
