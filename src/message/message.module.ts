import { Module } from '@nestjs/common'
import { FirebaseModule } from 'src/firebase/firebase.module'
import { PrismaService } from 'src/prisma.service'
import { MessageController } from './message.controller'
import { MessageService } from './message.service'

@Module({
	imports: [FirebaseModule],
	controllers: [MessageController],
	providers: [MessageService, PrismaService]
})
export class MessageModule {}
