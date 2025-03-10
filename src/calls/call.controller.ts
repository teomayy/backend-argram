import { Controller, Get, Param } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Controller('calls')
export class CallController {
	constructor(private prisma: PrismaService) {}

	@Get(':userId')
	async getCallHistory(@Param('userId') userId: string) {
		return this.prisma.call.findMany({
			where: {
				OR: [{ callerId: userId }, { receiverId: userId }]
			},
			orderBy: { startedAt: 'desc' }
		})
	}
}
