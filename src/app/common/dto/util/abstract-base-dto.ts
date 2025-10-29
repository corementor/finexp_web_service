import { ELifeCycle } from './elife-cycle';

export abstract class AbstractBaseDto {
  /** The id. */
  id?: string;

  /** The state. */
  state?: ELifeCycle = ELifeCycle.ACTIVE;

  /** The created by. */
  createdBy?: String;

  /** The created date. */
  createdAt: string = new Date().toISOString();

  /** The modified by. */
  modifiedBy?: String;

  /** The modified date. */
  modifiedAt?: String;
}
