import {expect} from "chai";
import * as https from "http";

describe('Contents', () => {
    describe('Main page', () =>{
        it('Site information', async () =>{
            var ind = -1;
            const url = 'http://localhost:8080';
            const request = https.request(url, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data = data + chunk.toString();
                });
            
                response.on('end', () => {
                    const body = data;
                    ind = data.indexOf('We are a social network designated for juniors. Those who want to develop their skills and become the next seniors. Our goal is to help you make this dream come true!<br /><br />How? With us, you can easily access the most current job inquiries, job offers, and links to free and relevant study sites categorized by subject. And above all, you will be able to express yourself and create new friendships and opportunities! <br /><br />So, what are you waiting for? Sign up for free!');
                });
            })
            
            request.on('error', (error) => {
                console.log('An error', error);
            });
            
            request.end();
            await new Promise(resolve => setTimeout(resolve, 1000));
            expect(ind).not.to.be.eql(-1);
        })
    })
})


