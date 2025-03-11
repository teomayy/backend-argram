import { Controller, Get, Param } from '@nestjs/common'
import { MessageService } from './message.service'

@Controller('message')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Get(':chatId')
	async getMessages(@Param('chatId') chatId: string) {
		return this.messageService.getMessage(chatId)
	}
}
