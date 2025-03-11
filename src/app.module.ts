import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { CallController } from './calls/call.controller'
import { ChatModule } from './chat/chat.module'
import { EskizModule } from './eskiz/eskiz.module'
import { FirebaseModule } from './firebase/firebase.module'
import { MessageModule } from './message/message.module'
import { PrismaService } from './prisma.service'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ConfigModule.forRoot({ cache: true, isGlobal: true }),
		AuthModule,
		UserModule,
		EskizModule,
		FirebaseModule,
		MessageModule,
		ChatModule
	],
	providers: [PrismaService],
	controllers: [CallController]
})
export class AppModule {}
