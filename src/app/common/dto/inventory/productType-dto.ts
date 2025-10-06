import { AbstractBaseDto } from '../util/abstract-base-dto';

export class ProductTypeDto extends AbstractBaseDto {
  productCode?: String;
  productName?: String;
  description?: String;
  size?: number;
  unitPrice?: number;
  sellUnitPrice?: number;
}
