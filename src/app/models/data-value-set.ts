import {DataValue, IDataValue} from './data-value';

export interface IDataValueSet {
  dataSet: string;
  orgUnit?: string;
  period?: string;
  dataValues: IDataValue[];
}

export class DataValueSet implements IDataValueSet {
  constructor(public dataSet: string, public orgUnit: string, public period: string, public dataValues: DataValue[]){}
}
