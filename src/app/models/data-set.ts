export interface IDataSet {
  name: string;
  id: string;
}
export class DataSet implements IDataSet{
  constructor(public name: string, public id: string){}
}
