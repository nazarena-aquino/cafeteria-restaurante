import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { sendSuccess, sendError } from '../utils/response';

export const generateMenuQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const menuUrl = process.env.PUBLIC_MENU_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu`;

    const { format = 'png' } = req.query;

    if (format === 'svg') {
      const svgString = await QRCode.toString(menuUrl, {
        type: 'svg',
        width: 300,
        margin: 2,
        color: {
          dark: '#2C1810',
          light: '#FFFFFF',
        },
      });

      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgString);
      return;
    }

    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2C1810',
        light: '#FFFFFF',
      },
    });

    sendSuccess(res, {
      qr_data_url: qrDataUrl,
      menu_url: menuUrl,
    });
  } catch (err) {
    console.error('Error generando QR:', err);
    sendError(res, 'Error generando código QR', 500);
  }
};

export const generateTableQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableNumber } = req.params;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const tableUrl = `${baseUrl}/menu?table=${tableNumber}`;

    const qrDataUrl = await QRCode.toDataURL(tableUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2C1810',
        light: '#FFFFFF',
      },
    });

    sendSuccess(res, {
      qr_data_url: qrDataUrl,
      table_url: tableUrl,
      table_number: tableNumber,
    });
  } catch (err) {
    sendError(res, 'Error generando QR de mesa', 500);
  }
};
