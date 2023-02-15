import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Param, Post, Put, Query, HttpException, HttpStatus } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { SaveCommentDto } from "./comment-service/dto/comment-service.dto";
import { PushLikeDto } from "./like-service/dto/like-service-request.dto";
import { LoginRequestDto } from "./user-service/dto/user-service-requests.dto";
import { LoginResponseDto } from "./user-service/dto/user-service-responses.dto";
import { SaveVideoPathDto } from "./video-service/dto/save-video-path.dto";
import { SaveVideoTitleDto } from "./video-service/save-video-title.dto";

@Controller('api/v1')
export class ApiGateway {
  constructor(
    private readonly httpService: HttpService,
  ) { }
  private readonly baseUrl = 'http://52.78.122.30';
  /*
   * Service: User/Auth 
   * Router: User: user/ , Auth: auth/
   * Port: 8080
  */
  @Get('user/feed/:id')
  async getMyFeedRequest(@Param('id') id: string): Promise<any> {
    try {
      const { data } = await this.httpService.axiosRef.get(`${this.baseUrl}:8080/user/feed/${id}`);
      return data;
    }
    catch (err) {
      throw new HttpException(
        '죄송해요. 사용자서버에 문제가 생겨 복구중이에요... router -> user/feed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('auth/login')
  async loginRequest(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDto | void> {
    try {
      const { phoneNumber, nickName } = loginRequestDto;
      const { data } = await this.httpService.axiosRef.post(`${this.baseUrl}:8080/auth/login`, { phoneNumber, nickName });
      return data;
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요 사용자서버에 문제가 생겨 복구중이에요... router -> auth/login',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /*
   * Service: video
   * Router: video/
   * Port: 8081 
  */
  @Get('video/list')
  async videoListRequest(): Promise<AxiosResponse<any>> {
    try {
      const { data } = await this.httpService.axiosRef.get(`${this.baseUrl}:8081/video/list`);
      return data;
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요 비디오 서버에 문제가 생겨 복구중이에요... router -> video/list',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get('video/detail/:videoId')
  async videoDetailInfoRequest(@Param('videoId') videoId: string): Promise<any> {
    try {
      const [videoInfoData, videoCommentData] = await Promise.all([
        this.httpService.axiosRef.get(`${this.baseUrl}:8081/video/detail/${videoId}`),
        this.httpService.axiosRef.get(`${this.baseUrl}:8084/video/comment/${videoId}`)
      ])
      const { data: videoInfoResponseData } = videoInfoData;
      const { data: videoCommentsResponseData } = videoCommentData;
      console.log('videoInfoData......', videoInfoData);
      return {
        statusCode: 200,
        message: 'OK',
        body: {
          detail: {
            ...videoInfoResponseData,
            comments: [
              ...videoCommentsResponseData
            ]
          }
        }
      }
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요 비디오 서버에 문제가 생겨 복구중이에요... router -> video/detail',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post('video/path')
  async saveThumbNailPath(@Body() saveVideoPathDto: SaveVideoPathDto) {
    try {
      const { userId, nickName, videoPath } = saveVideoPathDto;
      this.httpService.axiosRef.post(`${this.baseUrl}:8081/video/path`, { userId, nickName, videoPath })
      return {
        statusCode: 201,
        message: 'OK'
      }
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요 비디오 서버에 문제가 생겨 복구중이에요... router -> video/path',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post('video')
  async saveVideoTitle(@Body() saveVideoTitleDto: SaveVideoTitleDto) {
    try {
      const { userId, title } = saveVideoTitleDto;
      await this.httpService.axiosRef.post(`${this.baseUrl}:8081/video`, { userId, title })
      return;
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요 비디오 서버에 문제가 생겨 복구중이에요... router -> video',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Put('video')
  async notUploadVideo(@Body('userId') userId: string) {
    try {
      await this.httpService.axiosRef.put(`${this.baseUrl}:8081/video`, { userId });
      return;
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요 비디오 서버에 문제가 생겨 복구중이에요... router -> video, put...',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /* 
   * Service: Like 
   * Router: like/ 
   * Port: 8082 
  */
  @Put('like')
  async pushLikeRequest(@Body() pushLikeDto: PushLikeDto): Promise<void> {
    try {
      const { userId, videoId } = pushLikeDto;
      await this.httpService.axiosRef.put(`${this.baseUrl}:8082/like`, { userId, videoId });
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요. 좋아요서버에 문제가 생겨 복구중이에요... router -> like',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /*
   * Service: Search
   * Router: search/video/
   * Port: 8083
  */
  @Get('search/video')
  async searchVideoRequest(@Query('keyword') keyword: string) {
    try {
      const { data } = await this.httpService.axiosRef.get(`${this.baseUrl}:8083/search/video`, { params: { keyword } });
      return {
        statusCode: 200,
        message: 'OK',
        body: {
          data: [
            ...data
          ]
        }
      }
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요 검색 서버에 문제가 생겨 복구중이에요.... router -> search/video',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /*
   * Service: Comment
   * Router: video/comment
   * Port: 8084
  */
  @Post('video/comment')
  async saveComment(@Body() saveCommentDto: SaveCommentDto) {
    try {
      const { videoId, userId, nickName, content } = saveCommentDto;
      await this.httpService.axiosRef.post(`http://127.0.0.1:8084/video/comment`, { videoId, userId, nickName, content });
      return;
    }
    catch (err) {
      console.log(err)
      throw new HttpException(
        '죄송해요 댓글 서버에 문제가 생겨 복구중이에요.... router -> video/comment',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
