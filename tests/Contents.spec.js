import {expect} from "chai";
import * as fs from "fs";
import request from 'supertest';
import {app} from '../src/index.js';

describe('Contents', () => {
    describe('Main page', () =>{
        it('Site information', async () =>{
            var ind = -1;
           // const fs = module.constructor._load('fs');
            var data  = fs.readFileSync('./page/index.html'); 
            
            ind = data.indexOf('We are a social network designated for juniors. Those who want to develop their skills and become the next seniors. Our goal is to help you make this dream come true!<br /><br />How? With us, you can easily access the most current job inquiries, job offers, and links to free and relevant study sites categorized by subject. And above all, you will be able to express yourself and create new friendships and opportunities! <br /><br />So, what are you waiting for? Sign up for free!');
            
            
            
            
            expect(ind).not.to.be.eql(-1);
        })
    })
    describe('Path testing',async()=>{
        it('Test 1', async () =>{
            const res = await request(app).get('/');
            expect(res.statusCode).to.be.eql(200);
            
        })
        it('Test 2', async () =>{
            const res = await request(app).get('/3485');
            expect(res.statusCode).to.be.eql(404);
        })
        it('exit', async () =>{
            process.exit(0);
        })
    })
})



