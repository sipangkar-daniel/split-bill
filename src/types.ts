export type Person = {
  id: string;
  name: string;
};

export type Bill = {
  id: string;
  name: string;
  amount: number; // integer rupiah
  paidBy: string; // person id
  participants: string[]; // person ids
};

export type AppState = {
  people: Person[];
  bills: Bill[];
};

export type PersonBalance = {
  person: Person;
  share: number;
  paid: number;
  balance: number; // positive = receive, negative = pay
};

export type Settlement = {
  from: Person;
  to: Person;
  amount: number;
};
