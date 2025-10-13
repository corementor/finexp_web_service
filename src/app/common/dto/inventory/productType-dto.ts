import { AbstractBaseDto } from '../util/abstract-base-dto';

export class ProductTypeDto extends AbstractBaseDto {
  productCode?: string;
  productName?: string;
  description?: string;
  size?: number;
  unitPrice?: number;
  sellUnitPrice?: number;
}
