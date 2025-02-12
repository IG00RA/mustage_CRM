import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Sale } from '@/api/sales/data';

interface UseExportToExcelParams {
  sales: Sale[];
  dateRange: string;
}

const useExportToExcel = ({ sales, dateRange }: UseExportToExcelParams) => {
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Продажи');

    // Додаємо заголовки таблиці
    sheet.addRow(['Период', 'Количество', 'Сумма']);

    // Додаємо дані
    sales.forEach(sale => {
      sheet.addRow([sale.period, sale.quantity, sale.amount]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Формуємо назву файлу згідно з вибраним діапазоном
    const fileName = `sales_report_${dateRange}.xlsx`;
    saveAs(blob, fileName);
  };

  return exportToExcel;
};

export default useExportToExcel;
