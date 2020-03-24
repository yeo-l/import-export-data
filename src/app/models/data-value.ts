export interface IDataValue {
  dataElement: string;
  categoryOptionCombo: string;
  value: string;
  // orgUnit?: string;
  // period?: string;
}

export class DataValue implements IDataValue {

  constructor(public dataElement: string,
              public categoryOptionCombo: string,
              public value: string
              // ,public orgUnit?: string,
              // public period?: string
  ) {}

}
