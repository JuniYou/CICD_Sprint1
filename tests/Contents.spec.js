import {expect} from "chai";
import * as https from "http";

describe('Contents', () => {
    describe('Main page', () =>{
        it('Site information', async () =>{
            var ind = -1;
            const url = 'http://localhost';
            const request = https.request(url, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data = data + chunk.toString();
                });

