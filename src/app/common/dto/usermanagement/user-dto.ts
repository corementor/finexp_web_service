import { AbstractBaseDto } from '../util/abstract-base-dto';
import { RoleDTO } from './role-dto';

export class UserDTO extends AbstractBaseDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  role?: RoleDTO[];
}
