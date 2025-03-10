import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	getById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			},
			include: {
				tasks: true
			}
		})
	}

	getByPhone(phone: string) {
		return this.prisma.user.findUnique({
			where: {
				phone
			},
			include: {
				tasks: true
			}
		})
	}

	async createByPhone(phone: string) {
		return this.prisma.user.create({
			data: { phone, password: '', publicKey: '' },
			include: { tasks: true }
		})
	}

	async updateUser(id: string, dto: UpdateUserDto) {
		return this.prisma.user.update({
			where: { id },
			data: { ...dto }
		})
	}
}
