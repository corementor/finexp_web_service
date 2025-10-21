import { AbstractBaseDto } from '../util/abstract-base-dto';
import { ProductTypeDto } from './productType-dto';
import { SalesOrderDTO } from './sales-order-dto';

export class SalesOrderItemDTO extends AbstractBaseDto {
  productName?: string;
  size?: number;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  saleOrderEntity?: SalesOrderDTO;
  productType?: ProductTypeDto;
}
