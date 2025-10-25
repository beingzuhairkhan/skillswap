import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum SessionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class BookSessionDto {
  // @IsString()
  // @IsNotEmpty()
    @IsOptional()
  receiverId?: string;

  // @IsString()
  // @IsNotEmpty()
    @IsOptional()
  postId?: string;

  // @IsString()
  // @IsNotEmpty()
    @IsOptional()
  requesterId?: string;

  @IsString()
  @IsNotEmpty()
  sessionType: string;

  // @IsString()
  // @IsNotEmpty()
  durationTime: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @IsString()
  @IsOptional()
  studentNotes?: string;
}
