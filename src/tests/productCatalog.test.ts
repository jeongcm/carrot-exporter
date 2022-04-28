import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import { CreateCatalogPlanDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import ProductCatalogRoute from '@/modules/ProductCatalog/routes/productCatalog.route';


describe('Post Endpoints', () => {
  it('should create a new post', async () => {
    const res = await request(App)
      .post('/catalogPlan')
      .send({
        "catalogPlanName":"shrishti catalog 2",
        "catalogPlanDescription":"this catalog plan id=s for development purpose",
        "catalogPlanType":"OB"
    })
    expect(res.statusCode).toEqual(201)
    // expect(res.body).toHaveProperty('post')
  })
})
// afterAll(async () => {
//   await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
// });

// describe("Testing Product catalog APIs", ()=>{
//     it()
// })

// describe('Sample Test', () => {
//     it('should test that true === true', () => {
//       expect(true).toBe(true)
//     })
//   })