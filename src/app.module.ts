import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { CallController } from './calls/call.controller'
import { EskizModule } from './eskiz/eskiz.module'
import { FirebaseModule } from './firebase/firebase.module'
import { CallGateway } from './gateway/call.gateway'
import { SocketGateway } from './gateway/socket.gateway'
import { PrismaService } from './prisma.service'
import { UserModule } from './user/user.module'
import { MessageModule } from './message/message.module';

@Module({
	imports: [
		ConfigModule.forRoot({ cache: true, isGlobal: true }),
		AuthModule,
		UserModule,
		EskizModule,
		FirebaseModule,
		MessageModule
	],
	providers: [SocketGateway, CallGateway, PrismaService],
	controllers: [CallController]
})
export class AppModule {}
