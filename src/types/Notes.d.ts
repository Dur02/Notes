export interface NotesType {
  id: number;
  title: string;
  body: string;
  updated: string;
}

export interface OperateDataType {
  id?: number;
  title?: string;
  body?: string;
}

export type OperateType = "delete" | "edit";
