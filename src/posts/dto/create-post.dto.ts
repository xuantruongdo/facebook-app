import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {

  @IsNotEmpty({
    message: 'Nội dung không được để trống',
  })
  content: string;

  @IsOptional()
  image: string;
}
