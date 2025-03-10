import { Body, Controller, Put, Request } from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Auth()
	@Put('profile')
	async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
		return this.userService.updateUser(req.user.id, dto)
	}
}
