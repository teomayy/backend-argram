import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EskizController } from './eskiz.controller'
import { EskizService } from './eskiz.service'

@Module({
	imports: [ConfigModule, HttpModule],
	controllers: [EskizController],
	providers: [EskizService],
	exports: [EskizService]
})
export class EskizModule {}
