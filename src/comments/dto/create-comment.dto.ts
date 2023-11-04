import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({
    message: 'Nội dung không được để trống',
  })
  content: string;
}
