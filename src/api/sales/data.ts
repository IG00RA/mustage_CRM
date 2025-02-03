// salesData.ts

export type Sale = {
  period: string;
  amount: number;
  quantity: number;
};

export const salesData: Sale[] = [
  // *******************
  // 1. Погодинні дані за "Сегодня" (24 записи; формат "HH:MM")
  // *******************
  { period: '00:00', amount: 150, quantity: 10 },
  { period: '01:00', amount: 200, quantity: 15 },
  { period: '02:00', amount: 180, quantity: 12 },
  { period: '03:00', amount: 170, quantity: 11 },
  { period: '04:00', amount: 160, quantity: 10 },
  { period: '05:00', amount: 155, quantity: 9 },
  { period: '06:00', amount: 210, quantity: 14 },
  { period: '07:00', amount: 220, quantity: 15 },
  { period: '08:00', amount: 250, quantity: 18 },
  { period: '09:00', amount: 260, quantity: 20 },
  { period: '10:00', amount: 300, quantity: 25 },
  { period: '11:00', amount: 310, quantity: 26 },
  { period: '12:00', amount: 320, quantity: 28 },
  { period: '13:00', amount: 330, quantity: 30 },
  { period: '14:00', amount: 340, quantity: 32 },
  { period: '15:00', amount: 350, quantity: 34 },
  { period: '16:00', amount: 360, quantity: 35 },
  { period: '17:00', amount: 370, quantity: 36 },
  { period: '18:00', amount: 380, quantity: 37 },
  { period: '19:00', amount: 390, quantity: 38 },
  { period: '20:00', amount: 400, quantity: 40 },
  { period: '21:00', amount: 410, quantity: 42 },
  { period: '22:00', amount: 420, quantity: 43 },
  { period: '23:00', amount: 430, quantity: 44 },

  // *******************
  // 2. Погодинні дані за "Вчера" (24 записи; формат "Yesterday HH:MM")
  // *******************
  { period: 'Yesterday 00:00', amount: 140, quantity: 8 },
  { period: 'Yesterday 01:00', amount: 150, quantity: 9 },
  { period: 'Yesterday 02:00', amount: 160, quantity: 10 },
  { period: 'Yesterday 03:00', amount: 170, quantity: 11 },
  { period: 'Yesterday 04:00', amount: 180, quantity: 12 },
  { period: 'Yesterday 05:00', amount: 190, quantity: 13 },
  { period: 'Yesterday 06:00', amount: 200, quantity: 14 },
  { period: 'Yesterday 07:00', amount: 210, quantity: 15 },
  { period: 'Yesterday 08:00', amount: 220, quantity: 16 },
  { period: 'Yesterday 09:00', amount: 230, quantity: 17 },
  { period: 'Yesterday 10:00', amount: 240, quantity: 18 },
  { period: 'Yesterday 11:00', amount: 250, quantity: 19 },
  { period: 'Yesterday 12:00', amount: 260, quantity: 20 },
  { period: 'Yesterday 13:00', amount: 270, quantity: 21 },
  { period: 'Yesterday 14:00', amount: 280, quantity: 22 },
  { period: 'Yesterday 15:00', amount: 290, quantity: 23 },
  { period: 'Yesterday 16:00', amount: 300, quantity: 24 },
  { period: 'Yesterday 17:00', amount: 310, quantity: 25 },
  { period: 'Yesterday 18:00', amount: 320, quantity: 26 },
  { period: 'Yesterday 19:00', amount: 330, quantity: 27 },
  { period: 'Yesterday 20:00', amount: 340, quantity: 28 },
  { period: 'Yesterday 21:00', amount: 350, quantity: 29 },
  { period: 'Yesterday 22:00', amount: 360, quantity: 30 },
  { period: 'Yesterday 23:00', amount: 370, quantity: 31 },

  // *******************
  // 3. Дані за "Неделя" (7 записів; кожен запис – один день; формат "YYYY-MM-DD")
  // *******************
  { period: '2025-02-01', amount: 5000, quantity: 200 },
  { period: '2025-02-02', amount: 5200, quantity: 210 },
  { period: '2025-02-03', amount: 5400, quantity: 220 },
  { period: '2025-02-04', amount: 5600, quantity: 230 },
  { period: '2025-02-05', amount: 5800, quantity: 240 },
  { period: '2025-02-06', amount: 6000, quantity: 250 },
  { period: '2025-02-07', amount: 6200, quantity: 260 },

  // *******************
  // 4. Дані за "Месяц" (кілька прикладів днів протягом місяця; формат "YYYY-MM-DD")
  // Наприклад, для місяця можна надати дані для 10 днів:
  // *******************
  { period: '2025-01-01', amount: 3000, quantity: 150 },
  { period: '2025-01-05', amount: 3200, quantity: 160 },
  { period: '2025-01-10', amount: 3400, quantity: 170 },
  { period: '2025-01-15', amount: 3600, quantity: 180 },
  { period: '2025-01-20', amount: 3800, quantity: 190 },
  { period: '2025-01-25', amount: 4000, quantity: 200 },
  { period: '2025-01-30', amount: 4200, quantity: 210 },

  // *******************
  // 5. Дані за "Квартал" (3 записи; кожен запис – агреговані дані за місяць; формат "YYYY-MM")
  // *******************
  { period: '2025-01', amount: 13000, quantity: 550 },
  { period: '2025-02', amount: 14000, quantity: 600 },
  { period: '2025-03', amount: 15000, quantity: 650 },

  // *******************
  // 6. Дані за "Год" (12 записів; кожен запис – агреговані дані за місяць; формат "YYYY-MM")
  // *******************
  { period: '2024-03', amount: 10000, quantity: 450 },
  { period: '2024-04', amount: 10500, quantity: 460 },
  { period: '2024-05', amount: 11000, quantity: 470 },
  { period: '2024-06', amount: 11500, quantity: 480 },
  { period: '2024-07', amount: 12000, quantity: 490 },
  { period: '2024-08', amount: 12500, quantity: 500 },
  { period: '2024-09', amount: 13000, quantity: 510 },
  { period: '2024-10', amount: 13500, quantity: 520 },
  { period: '2024-11', amount: 14000, quantity: 530 },
  { period: '2024-12', amount: 14500, quantity: 540 },
  { period: '2025-01', amount: 15000, quantity: 550 },
  { period: '2025-02', amount: 15500, quantity: 560 },
];
