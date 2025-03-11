import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ChatGateway } from './chat.gateway'

@Module({
	providers: [ChatGateway, PrismaService]
})
export class ChatModule {}
