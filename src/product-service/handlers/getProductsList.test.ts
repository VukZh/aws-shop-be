import { handler as getProductsList} from './getProductsList'
import { productsLambdaTest } from "../../product-service/mocks/data";
describe('getProductsList', () => {

  it('getProductsList test', async () => {
    const data = await getProductsList();
    expect(data.statusCode).toBe(200);
    expect(JSON.parse(data.body).length).toBe(productsLambdaTest.length);
  });
});
