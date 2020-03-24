import {DataValue, IDataValue} from './data-value';

export interface IDataValueSet {
  dataSet: string;
  dataValues: IDataValue[];
  orgUnit?: string;
  period?: string;
  attributeOptionCombo?: string;
  completeDate?: string;
}

export class DataValueSet implements IDataValueSet {
  constructor(public dataSet: string, public dataValues: DataValue[], public orgUnit?: string, public period?: string, public attributeOptionCombo?: string, public completeDate: string = ''){}
}
