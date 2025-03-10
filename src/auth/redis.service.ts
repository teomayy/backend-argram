import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
	private client = new Redis()

	constructor() {
		this.client = new Redis({
			host: process.env.REDIS_HOST || '127.0.0.1',
			port: Number(process.env.REDIS_PORT) || 6379
		})
	}

	async setOtp(phone: string, code: string) {
		await this.client.setex(`otp:${phone}`, 300, code)
	}

	async getOtp(phone: string) {
		return this.client.get(`otp:${phone}`)
	}

	async deleteOtp(phone: string) {
		await this.client.del(`otp:${phone}`)
	}
}
