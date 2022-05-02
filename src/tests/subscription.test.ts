import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import SubscriptionRoute from '@/modules/Subscriptions/routes/subscriptions.route';
import PartyRoute from '@/modules/Party/routes/party.route';

afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});


describe('Testing Subscription Module', () => {
    let subscriptionRoute, subscriptionDB, token, subscriptionId, subscriptionProductDB, subscribedProductId;

    beforeAll(async () => {
        subscriptionRoute = new SubscriptionRoute();
        let partRoute = new PartyRoute()
        subscriptionDB = subscriptionRoute.subscriptionController.subscriptionService.subscription;
        subscriptionProductDB = subscriptionRoute.subscriptionController.subscriptionService.subscribedProduct;

        const app = new App([partRoute]);

        const res = await request(app.getServer()).post('/login').send({
            "userId": "shrishti.raj@gmail.com",
            "password": "Password@123!"
        })
        token = res.body.token;
    });

    describe('[POST] /subscription - create new subscription', () => {

        it('return 200 with new subscription detail', async () => {

            const requestPayload = {
                "subscriptionStatus": "AC",
                "subscriptionConsent": true,
                "subscriptionActivatedAt": "2022-04-07T12:23:41.347Z",
                "subscriptionTerminatedAt": "2022-04-07",
                "subscriptionCommitmentType": "AC",
                "catalogPlanId": "CT24060300000006"
            };
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            subscriptionDB.create = jest.fn().mockReturnValue({
                "createdAt": "2022-05-02T07:21:24.993Z",
                "updatedAt": "2022-05-02T07:21:24.993Z",
                "subscriptionKey": 1,
                "subscriptionStatus": "AC",
                "subscriptionConsent": true,
                "subscriptionActivatedAt": "2022-04-07T12:23:41.347Z",
                "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                "subscriptionCommitmentType": "AC",
                "subscriptionId": "SU24060300000001",
                "catalogPlanKey": 2,
                "customerAccountKey": 2,
                "createdBy": "PU24053000000003",
                "updatedBy": "PU24053000000003"
            });
            const res = await request(app.getServer()).post('/subscription').send(requestPayload)
                .set('x-authorization', `Bearer ${token}`)

            expect(res.statusCode).toEqual(201)
            subscriptionId = res.body.data.subscriptionId

            // expect(res.body).toHaveProperty('post')
        })
        it('return 401 with unathuorized', async () => {
            const requestPayload = {
                "subscriptionStatus": "AC",
                "subscriptionConsent": true,
                "subscriptionActivatedAt": "2022-04-07T12:23:41.347Z",
                "subscriptionTerminatedAt": "2022-04-07",
                "subscriptionCommitmentType": "AC",
                "catalogPlanId": "CT24060300000006"
            };
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            subscriptionDB.create = jest.fn().mockReturnValue({
                "createdAt": "2022-05-02T07:21:24.993Z",
                "updatedAt": "2022-05-02T07:21:24.993Z",
                "subscriptionKey": 1,
                "subscriptionStatus": "AC",
                "subscriptionConsent": true,
                "subscriptionActivatedAt": "2022-04-07T12:23:41.347Z",
                "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                "subscriptionCommitmentType": "AC",
                "subscriptionId": "SU24060300000001",
                "catalogPlanKey": 2,
                "customerAccountKey": 2,
                "createdBy": "PU24053000000003",
                "updatedBy": "PU24053000000003"
            });
            const res = await request(app.getServer()).post('/subscription').send(requestPayload)

            expect(res.statusCode).toEqual(401)
        })

        it('return 400 with Validation error', async () => {
            const requestPayload = {
                "subscriptionStatus": "AC",
                "subscriptionConsent": true,
                "subscriptionActivatedAt": "2022-04-07T12:23:41.347Z",
                "subscriptionTerminatedAt": "2022-04-07",
                "subscriptionCommitmentType": "AC"
            };
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            subscriptionDB.create = jest.fn().mockReturnValue({ ...requestPayload, catalogPlanKey: 121336 });
            const res = await request(app.getServer()).post('/subscription').send(requestPayload).set('x-authorization', `Bearer ${token}`)

            expect(res.statusCode).toEqual(400)
        })
    })

    describe('[GET] /subscriptions - All subscription', () => {
        it('returns 200 with found all catalogPlans', async () => {
            subscriptionDB.findAll = jest.fn().mockReturnValue([
                {
                    "subscriptionKey": 1,
                    "subscriptionId": "SU24060300000001",
                    "catalogPlanKey": 2,
                    "customerAccountKey": 2,
                    "subscriptionActivatedAt": "2022-04-07T12:23:41.000Z",
                    "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                    "subscriptionStatus": "AC",
                    "subscriptionConsent": true,
                    "subscriptionCommitmentType": "AC",
                    "deletedAt": null,
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T07:21:24.000Z",
                    "updatedAt": "2022-05-02T07:21:24.000Z",
                    "catalog_plan_key": 2,
                    "SubscribedProducts": []
                },
                {
                    "subscriptionKey": 2,
                    "subscriptionId": "SU24060300000003",
                    "catalogPlanKey": 2,
                    "customerAccountKey": 2,
                    "subscriptionActivatedAt": "2022-04-07T12:23:41.000Z",
                    "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                    "subscriptionStatus": "AC",
                    "subscriptionConsent": true,
                    "subscriptionCommitmentType": "AC",
                    "deletedAt": null,
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T07:21:24.000Z",
                    "updatedAt": "2022-05-02T07:21:24.000Z",
                    "catalog_plan_key": 2,
                    "SubscribedProducts": []
                },
                {
                    "subscriptionKey": 3,
                    "subscriptionId": "SU24060300000004",
                    "catalogPlanKey": 2,
                    "customerAccountKey": 2,
                    "subscriptionActivatedAt": "2022-04-07T12:23:41.000Z",
                    "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                    "subscriptionStatus": "AC",
                    "subscriptionConsent": true,
                    "subscriptionCommitmentType": "AC",
                    "deletedAt": null,
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T07:21:24.000Z",
                    "updatedAt": "2022-05-02T07:21:24.000Z",
                    "catalog_plan_key": 2,
                    "SubscribedProducts": []
                }
            ]);
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);

            const res = await request(app.getServer()).get('/subscriptions').send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
            expect(res.statusCode).toEqual(200);
        })
        it('returns 401  unAuthorized', async () => {
            subscriptionDB.findAll = jest.fn().mockReturnValue([
                {
                    "subscriptionKey": 1,
                    "subscriptionId": "SU24060300000001",
                    "catalogPlanKey": 2,
                    "customerAccountKey": 2,
                    "subscriptionActivatedAt": "2022-04-07T12:23:41.000Z",
                    "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                    "subscriptionStatus": "AC",
                    "subscriptionConsent": true,
                    "subscriptionCommitmentType": "AC",
                    "deletedAt": null,
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T07:21:24.000Z",
                    "updatedAt": "2022-05-02T07:21:24.000Z",
                    "catalog_plan_key": 2,
                    "SubscribedProducts": []
                },
                {
                    "subscriptionKey": 2,
                    "subscriptionId": "SU24060300000003",
                    "catalogPlanKey": 2,
                    "customerAccountKey": 2,
                    "subscriptionActivatedAt": "2022-04-07T12:23:41.000Z",
                    "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                    "subscriptionStatus": "AC",
                    "subscriptionConsent": true,
                    "subscriptionCommitmentType": "AC",
                    "deletedAt": null,
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T07:21:24.000Z",
                    "updatedAt": "2022-05-02T07:21:24.000Z",
                    "catalog_plan_key": 2,
                    "SubscribedProducts": []
                },
                {
                    "subscriptionKey": 3,
                    "subscriptionId": "SU24060300000004",
                    "catalogPlanKey": 2,
                    "customerAccountKey": 2,
                    "subscriptionActivatedAt": "2022-04-07T12:23:41.000Z",
                    "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                    "subscriptionStatus": "AC",
                    "subscriptionConsent": true,
                    "subscriptionCommitmentType": "AC",
                    "deletedAt": null,
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T07:21:24.000Z",
                    "updatedAt": "2022-05-02T07:21:24.000Z",
                    "catalog_plan_key": 2,
                    "SubscribedProducts": []
                }
            ]);
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);

            const res = await request(app.getServer()).get('/subscriptions').send()
            expect(res.statusCode).toEqual(401);
        })
    })
    describe('[GET] /subscription/:subscriptionId -get  subscription by id', () => {
        it('should return 200  with  subscription by id', async () => {
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            subscriptionDB.findOne = jest.fn().mockReturnValue({
                "subscriptionId": "SU24060300000001",
                "catalogPlanKey": 2,
                "customerAccountKey": 2,
                "subscriptionActivatedAt": "2022-04-07T12:23:41.000Z",
                "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                "subscriptionStatus": "AC",
                "subscriptionConsent": true,
                "subscriptionCommitmentType": "AC",
                "deletedAt": null,
                "createdBy": "PU24053000000003",
                "updatedBy": "PU24053000000003",
                "createdAt": "2022-05-02T07:21:24.000Z",
                "updatedAt": "2022-05-02T07:21:24.000Z",
                "catalog_plan_key": 2,
                "CatalogPlan": {
                    "catalogPlanId": "CT24060300000006",
                    "catalogPlanName": "shrishti catalog 1 update",
                    "catalogPlanDescription": "this catalog plan id=s for development purpose",
                    "catalogPlanType": "MO",
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T05:01:24.000Z",
                    "updatedAt": "2022-05-02T05:01:24.000Z"
                }
            })
            const res = await request(app.getServer()).get(`/subscription/${subscriptionId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
            expect(res.statusCode).toEqual(200)
        })
    })
    describe('[PUT] /subscription/:subscriptionId - update subscription', () => {
        it('should return 200  with  subscription updated data', async () => {
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            const catalogDetail = await request(app.getServer()).get(`/subscription/${subscriptionId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
            let requestPayload = {
                "subscriptionStatus": "AC"
            };
            subscriptionRoute.subscriptionController.subscriptionService.createSubscriptionHistory = jest.fn().mockImplementation();
            subscriptionDB.update = jest.fn().mockReturnValue({})
            subscriptionDB.findByPk = jest.fn().mockReturnValue({
                "subscriptionId": "SU24060300000001",
                "catalogPlanKey": 2,
                "customerAccountKey": 2,
                "subscriptionActivatedAt": "2022-04-07T12:23:41.000Z",
                "subscriptionTerminatedAt": "2022-04-07T00:00:00.000Z",
                "subscriptionStatus": "AC",
                "subscriptionConsent": true,
                "subscriptionCommitmentType": "AC",
                "createdBy": "PU24053000000003",
                "updatedBy": "PU24053000000003",
                "createdAt": "2022-05-02T07:21:24.000Z",
                "updatedAt": "2022-05-02T07:21:24.000Z",
                "catalog_plan_key": 2
            })
            const res = await request(app.getServer()).put(`/subscription/${subscriptionId}`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`)
            expect(res.statusCode).toEqual(200)
        })
    });
    describe('[POST] /subscribeProduct - create new subcribedProduct', () => {

        it('return 400  with Resource not found', async () => {

            const requestPayload = {
                "subscribedProductStatus":"AC",
                "subscribedProductFrom":"2022-12-12",
                "subscribedProductTo":"2022-12-12",
                "catalogPlanProductType":"ON"
            };
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            subscriptionProductDB.create = jest.fn().mockReturnValue({});
            const res = await request(app.getServer()).post('/subscribeProduct').send(requestPayload)
                .set('x-authorization', `Bearer ${token}`)

            expect(res.statusCode).toEqual(400)
            expect(res.body).toEqual({"message":"resourceId should not be empty,resourceId must be a string"})
        })
        it('return 401  unAuthorized', async () => {

            const requestPayload = {
                "subscribedProductStatus":"AC",
                "subscribedProductFrom":"2022-12-12",
                "subscribedProductTo":"2022-12-12",
                "catalogPlanProductType":"ON",
                "resourceId":"RE2451500000001"
            };
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            subscriptionDB.create = jest.fn().mockReturnValue({});
            const res = await request(app.getServer()).post('/subscribeProduct').send(requestPayload)
            expect(res.statusCode).toEqual(401)
            expect(res.body).toEqual({
                "message": "Authentication token missing"
            })
        })
        
        it('return 200 with subscribed product data', async () => {
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            
            const requestPayload = {
                "subscribedProductStatus":"AC",
                "subscribedProductFrom":"2022-12-12",
                "subscribedProductTo":"2022-12-12",
                "catalogPlanProductType":"ON",
                "resourceId":"RE24060300000001"
            };
            subscriptionDB.create = jest.fn().mockReturnValue({ ...requestPayload, catalogPlanKey: 121336 });
            const res = await request(app.getServer()).post('/subscribeProduct').send(requestPayload).set('x-authorization', `Bearer ${token}`)
            subscribedProductId = res.body.data.subscribedProductId
            expect(res.statusCode).toEqual(201)
        })
    })


    describe('[GET] /subscribeProduct/:subscribedProductId -get  subscribeproduct by id', () => {
        it('should return 200  with  subscribed product details by id', async () => {
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            subscriptionProductDB.findOne = jest.fn().mockReturnValue({
                "createdAt": "2022-05-02T07:21:24.993Z",
                "updatedAt": "2022-05-02T07:21:24.993Z",
                "subscribedProductKey": 1,
                "subscribedProductId": "SP24060300000009",
                "resourceKey": 1,
                "subscriptionKey": 1,
                "catalogPlanProductKey": 1,
                "subscribedProductStatus": "AC",
                "subscribedProductFrom": "2022-12-12T00:00:00.000Z",
                "subscribedProductTo": "2022-12-12T00:00:00.000Z",
                "createdBy": "PU24053000000003",
                "updatedBy": "PU24053000000003"
            })
            const res = await request(app.getServer()).get(`/subscribeProduct/${subscribedProductId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
            expect(res.statusCode).toEqual(200)
        })
        it('should return 200  with  subscribed product details by id', async () => {
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
            subscriptionProductDB.findOne = jest.fn().mockReturnValue({})
            const res = await request(app.getServer()).get(`/subscribeProduct/bfghfghfgh`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
            expect(res.statusCode).toEqual(200)
            expect(res.body).toEqual({
                "data": {},
                "message": "success"
            })
        })
    })
    describe('[PUT] /subscribeProduct/:subscribedProductId - update subscribedProduct', () => {
      

        it('should return 200  with  subscribed product updated data', async () => {
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
    
            subscriptionRoute.subscriptionController.subscriptionService.createSubscriptionHistory = jest.fn().mockImplementation();
            const updatePaylaod = {
                "subscribedProductStatus":"SP"
                
            }
            subscriptionProductDB.update = jest.fn().mockReturnValue({})
            subscriptionProductDB.findByPk = jest.fn().mockReturnValue({
                "subscribedProductId": "SP24060300000010",
                "subscriptionKey": 1,
                "catalogPlanProductKey": 1,
                "resourceKey": 1,
                "subscribedProductFrom": "2022-12-12T00:00:00.000Z",
                "subscribedProductTo": "2022-12-12T00:00:00.000Z",
                "subscribedProductStatus": "SP",
                "createdBy": "PU24053000000003",
                "updatedBy": "PU24053000000003",
                "createdAt": "2022-05-02T07:21:24.000Z",
                "updatedAt": "2022-05-02T07:21:24.000Z",
                "subscription_key": 1
            })
            const res = await request(app.getServer()).put(`/subscribeProduct/${subscribedProductId}`).send(updatePaylaod).set(`X-AUTHORIZATION`, `Bearer ${token}`)
            expect(res.statusCode).toEqual(200)
        })
        it('should return 400  with  No data found message', async () => {
            (Sequelize as any).authenticate = jest.fn();
            const app = new App([subscriptionRoute]);
    
            subscriptionRoute.subscriptionController.subscriptionService.createSubscriptionHistory = jest.fn().mockImplementation();
            const updatePaylaod = {
                "subscribedProductStatus":"SP"
                
            }
            subscriptionProductDB.update = jest.fn().mockReturnValue({})
            subscriptionProductDB.findByPk = jest.fn().mockReturnValue({})
            const res = await request(app.getServer()).put(`/subscribeProduct/ghgghjghjgh`).send(updatePaylaod).set(`X-AUTHORIZATION`, `Bearer ${token}`)
            expect(res.statusCode).toEqual(200)
            expect(res.body).toEqual({
                "data": {},
                "message": "success"
            })
        })
    });

})