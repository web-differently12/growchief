export interface IUploadProvider {
  uploadSimple(path: string): Promise<string>;
  uploadFile(file: Express.Multer.File, fileName?: string): Promise<any>;
  removeFile(filePath: string): Promise<void>;
}
