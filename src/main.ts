import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.use(cookieParser())

	app.setGlobalPrefix('api')
	app.enableCors({
		origin: '*',
		credentials: true,
		exposedHeaders: 'set-cookie'
	})

	await app.listen(4500)
	console.log('🚀 HTTP Server running on http://localhost:4500')
}
bootstrap()
