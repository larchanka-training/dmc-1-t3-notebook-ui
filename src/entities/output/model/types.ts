export type OutputText = {
  type: "text";
  payload: string;
};

export type OutputObject = {
  type: "object";
  payload: unknown;
};

export type OutputTable = {
  type: "table";
  payload: {
    columns: string[];
    rows: unknown[][];
  };
};

export type OutputChart = {
  type: "chart";
  payload: unknown;
};

export type OutputError = {
  type: "error";
  payload: {
    name?: string;
    message: string;
    stack?: string;
  };
};

export type OutputItem =
  | OutputText
  | OutputObject
  | OutputTable
  | OutputChart
  | OutputError;
