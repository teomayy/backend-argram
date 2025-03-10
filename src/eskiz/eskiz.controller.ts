import { Controller } from '@nestjs/common';
import { EskizService } from './eskiz.service';

@Controller('eskiz')
export class EskizController {
  constructor(private readonly eskizService: EskizService) {}
}
