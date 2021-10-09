import {Body, Controller, Post, Query, UploadedFile, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {UploadService} from './upload.service';
import {FileUploadedResponse} from 'common/response/upload/upload.response';
import {ExternalGraphFileUploadDto, FileUploadQueryDto, GraphUploadDto, UrlFileUploadDto} from './upload.dto';
import {SuccessResponse} from 'common/response/basic.response';
import {ResultsService} from 'src/results/results.service';
import {Session} from 'src/decorators/session.decorator';
import {AppError} from 'src/errors/app.error';
import {Logger} from '../log/logger';

@Controller('/upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService,
                private readonly resultsService: ResultsService) {
    }

    @Post('/data')
    @UseInterceptors(FileInterceptor('file'))
    public async handleDataUpload(
        @UploadedFile() file: Express.Multer.File,
        @Query() queryDto: FileUploadQueryDto,
        @Session() session: string,
    ): Promise<FileUploadedResponse> {
        Logger.getInstance().log('info', queryDto);
        return {
            data: await this.uploadService.uploadFile(queryDto, session, file),
            success: true
        };
    }

    @Post('/graph-file')
    @UseInterceptors(FileInterceptor('file'))
    public async handleGraphFileUpload(
        @UploadedFile() file: Express.Multer.File,
        @Body('graphData') graphDataDto: string,
        @Session() session: string,
    ): Promise<SuccessResponse> {
        let graphDto: ExternalGraphFileUploadDto | null = null;
        try {
            graphDto = JSON.parse(graphDataDto);
        } catch (err) {
            throw AppError.fromName('GRAPH_DATA_INVALID', [err]);
        }
        await this.uploadService.saveGraphFile(session, file.buffer);
        await this.resultsService.startAndProcessResults(
            session,
            this.uploadService.getDataFilePath(session),
            graphDto.delimiter,
            this.uploadService.getGraphFilePath(session),
            {
                variables: JSON.stringify(graphDto.variables),
                selectedMethods: graphDto.selectedMethods
            }
        );
        return {success: true};
    }

    @Post('/graph')
    @UseInterceptors(FileInterceptor('file'))
    public async handleGraphUpload(
        @UploadedFile() file: Express.Multer.File,
        @Body() graphDto: GraphUploadDto,
        @Session() session: string,
    ): Promise<SuccessResponse> {
        await this.uploadService.transformAndSaveGraph(session, graphDto);
        await this.resultsService.startAndProcessResults(
            session,
            this.uploadService.getDataFilePath(session),
            graphDto.delimiter,
            this.uploadService.getGraphFilePath(session),
            {
                variables: JSON.stringify(graphDto.variables),
                selectedMethods: graphDto.selectedMethods
            }
        );
        return {success: true};
    }

    @Post('/url')
    public async handleUrlUpload(
        @Body() urlFileUploadDto: UrlFileUploadDto,
        @Session() session: string
    ): Promise<FileUploadedResponse> {
        Logger.getInstance().log('info', urlFileUploadDto);
        return {
            data: await this.uploadService.getFileFromLink(urlFileUploadDto, session),
            success: true
        };
    }

    @Post('/full-file')
    public async loadFullFile(
        @Session() session: string,
        @Body() queryDto: FileUploadQueryDto,
    ): Promise<FileUploadedResponse> {
        Logger.getInstance().log('info', `Received request for full file for session: ${session} `);
        return {
            data: await this.uploadService.loadFullFile(session, queryDto),
            success: true
        };
    }

    /* @Post('/generate/linear')
     public async handleGenerateDataset(@Body() generateLinearDatasetDto: GenerateLinearDatasetDto,
                                        @Session() session: string): Promise<FileUploadedResponse> {
         Logger.getInstance().log('info', generateLinearDatasetDto);
         return {
             data: await this.uploadService.generateLinearDataset(generateLinearDatasetDto, session),
             success: true
         };
     }*/
}
