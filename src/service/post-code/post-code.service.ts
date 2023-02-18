import { HttpService } from '@nestjs/axios/dist';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';
import { PostCodeResponse } from 'src/dto/post-code';
import { Location } from 'src/dto/request';

@Injectable()
export class PostCodeService {

    constructor(
        private httpService: HttpService
    ) { }


    public async getLocationFromPostCode(postCode: string): Promise<Location> {
        const url = `https://api.postcodes.io/postcodes/${postCode}`;
        const response: Observable<AxiosResponse> = this.httpService.get(url);
        const data = await firstValueFrom(response);
        const postCodeResponse: PostCodeResponse = data.data;
        const location: Location = {
            lat: postCodeResponse.result.latitude,
            lon: postCodeResponse.result.longitude
        }
        return location;
    }
}
