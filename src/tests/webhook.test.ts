import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import WebhookRoutes from '@/modules/CommonService/routes/webhooforbilling.route';
import PartyRoute from '@/modules/Party/routes/party.route';

afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});


describe('Testing ProductCatalog Module', () => {
    let webhookRoutes, catalogPlan, token, catalogPlanProductDB;

    beforeAll(async () => {
        webhookRoutes = new WebhookRoutes();
        let partRoute = new PartyRoute()

        const app = new App([partRoute]);

        const res = await request(app.getServer()).post('/login').send({
            "userId": "shrishti.raj@gmail.com",
            "password": "Password@123!"
        })

        token = res.body.token; // save the token!

    });
    describe("[POST] /webhookforbilling",  () => {
        it('return 200 having cutomer creation processed ', async () => {

            const requestPayload = {
                "eventType": "CustomerCreated",
                "Customer": {
                    "firstName": "shrishti",
                    "lastName": "Raj",
                    "primaryEmail": "shrishti.raj@exubers.com",
                    "primaryPhone": "7004429432",
                    "companyName": "Shri Inc.",
                    "id": "john.doe@nexclipper.io"
                }
            };
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([webhookRoutes]);
            const res = await request(app.getServer()).post('/webhookforbilling').send(requestPayload)
                .set('x-authorization', `Bearer ${token}`)

            expect(res.statusCode).toEqual(200)
            expect(res.body).toEqual( {"message": "CustomerCreated processed"});
        })
    })


    // it('return 200 having subscription creation processed ', async () => {

    //     const requestPayload = {
    //         "eventType":"SubscriptionCreated",
    //         "Subscription":{
    //             "status":"AC",
    //             "activatedTimestamp":"2022-04-07T12:23:41.000Z",
    //             "terminatedTimeStamp":"2022-04-22T12:23:41.000Z",
    //             "planCode":"ct2451500000001",
    //             "id":4963900
    //                  }
    //     };
    //     (Sequelize as any).authenticate = jest.fn();
    //     const app = new App([webhookRoutes]);
    //     const res = await request(app.getServer()).post('/webhookforbilling').send(requestPayload)
    //         .set('x-authorization', `Bearer ${token}`)

    //     expect(res.statusCode).toEqual(200)
    //     expect(res.body).toEqual( {"message": "CustomerCreated processed"});
    // })
})
