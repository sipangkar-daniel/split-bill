import type {AppState} from './types';

export const INITIAL_DATA: AppState = (() => {
  if (!import.meta.env.DEV) {
    return {
      people: [],
      bills: [],
    };
  }

  return {
    people: [
      { id: 'p1', name: 'Andi' },
      { id: 'p2', name: 'Budi' },
      { id: 'p3', name: 'Citra' },
      { id: 'p4', name: 'Dewi' },
      { id: 'p5', name: 'Eko' },
      { id: 'p6', name: 'Fajar' },
      { id: 'p7', name: 'Gita' },
      { id: 'p8', name: 'Hadi' },
      { id: 'p9', name: 'Indah' },
      { id: 'p10', name: 'Joko' },
    ],
    bills: [
      {
        id: 'b1',
        name: 'Makan Malam Restoran',
        amount: 750000,
        paidBy: 'p1',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5'],
      },
      {
        id: 'b2',
        name: 'Sewa Villa',
        amount: 2500000,
        paidBy: 'p2',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
      },
      {
        id: 'b3',
        name: 'Bensin Mobil',
        amount: 350000,
        paidBy: 'p3',
        participants: ['p1', 'p2', 'p3', 'p4'],
      },
      {
        id: 'b4',
        name: 'Tiket Tol',
        amount: 180000,
        paidBy: 'p4',
        participants: ['p1', 'p2', 'p3', 'p4'],
      },
      {
        id: 'b5',
        name: 'Belanja Snack',
        amount: 220000,
        paidBy: 'p5',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
      },
      {
        id: 'b6',
        name: 'Makan Siang',
        amount: 450000,
        paidBy: 'p6',
        participants: ['p5', 'p6', 'p7', 'p8'],
      },
      {
        id: 'b7',
        name: 'Parkir',
        amount: 50000,
        paidBy: 'p7',
        participants: ['p5', 'p6', 'p7', 'p8'],
      },
      {
        id: 'b8',
        name: 'Kopi & Teh',
        amount: 120000,
        paidBy: 'p8',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
      },
      {
        id: 'b9',
        name: 'Sewa Alat BBQ',
        amount: 300000,
        paidBy: 'p9',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
      },
      {
        id: 'b10',
        name: 'Bahan Bakar Grill',
        amount: 150000,
        paidBy: 'p10',
        participants: ['p7', 'p8', 'p9', 'p10'],
      },
      {
        id: 'b11',
        name: 'Tiket Masuk Wisata',
        amount: 600000,
        paidBy: 'p1',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
      },
      {
        id: 'b12',
        name: 'Makan Pagi',
        amount: 200000,
        paidBy: 'p2',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5'],
      },
      {
        id: 'b13',
        name: 'Air Mineral',
        amount: 80000,
        paidBy: 'p3',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
      },
      {
        id: 'b14',
        name: 'Sewa Tenda',
        amount: 400000,
        paidBy: 'p4',
        participants: ['p6', 'p7', 'p8', 'p9', 'p10'],
      },
      {
        id: 'b15',
        name: 'Oleh-oleh',
        amount: 550000,
        paidBy: 'p5',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5'],
      },
      {
        id: 'b16',
        name: 'Servis Mobil',
        amount: 800000,
        paidBy: 'p6',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
      },
      {
        id: 'b17',
        name: 'Cuci Mobil',
        amount: 75000,
        paidBy: 'p7',
        participants: ['p1', 'p2', 'p3', 'p4'],
      },
      {
        id: 'b18',
        name: 'Makan Malam BBQ',
        amount: 900000,
        paidBy: 'p8',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
      },
      {
        id: 'b19',
        name: 'Tip Pelayan',
        amount: 100000,
        paidBy: 'p9',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
      },
      {
        id: 'b20',
        name: 'P3K & Obat',
        amount: 65000,
        paidBy: 'p10',
        participants: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
      },
    ],
  };
})();