import { plainToInstance } from 'class-transformer';

/**
 * The Class GenericDeserializer.
 *
 * @author Jeremie Ukundwa Tuyisenge
 * @version 1.0
 */

export class GenericDeserializer {
  public deserializeJson<T>(json: string, data: { new (): T }): T {
    return plainToInstance(data, json);
  }

  public deserializeJsonArray<T>(json: string, valueType: { new (): T }): T[] {
    if (Array.isArray(json)) {
      return plainToInstance(valueType, json);
    } else {
      throw new Error('Provided JSON is not an array.');
    }
  }
}
