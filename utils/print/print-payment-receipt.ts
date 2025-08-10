// utils/thermal-printer.ts

export interface PaymentData {
  amount: number | string;
  method: string;
  notes?: string;
}

export interface MembershipData {
  _id: string;
  memberDetails: {
    memberId: string;
    name: string;
    phone: string;
  };
  membershipTypeDetails: {
    name: string;
  };
  amount: number;
  amountPaid: number;
  startDate: string;
  endDate: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
}

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "MUSCLE UNIT",
  address: "Naduvattam",
  city: "Koppam, Kerala 679308",
  phone: "+91 7561821397",
};

/**
 * Generate ESC/POS formatted receipt for thermal printer
 */
export const generateMembershipReceipt = (
  paymentData: PaymentData,
  membership: MembershipData,
  companyInfo: CompanyInfo = DEFAULT_COMPANY_INFO
): string => {
  const now = new Date();
  const receiptId = `RCP-${Date.now()}`;

  // ESC/POS commands for 58mm thermal printer
  const ESC = "\x1b";
  const GS = "\x1d";

  // Control commands
  const INIT = ESC + "@"; // Initialize printer
  const CENTER = ESC + "a" + "\x01"; // Center alignment
  const LEFT = ESC + "a" + "\x00"; // Left alignment
  const BOLD_ON = ESC + "E" + "\x01"; // Bold on
  const BOLD_OFF = ESC + "E" + "\x00"; // Bold off
  const DOUBLE_HEIGHT = GS + "!" + "\x01"; // Double height
  const NORMAL_SIZE = GS + "!" + "\x00"; // Normal size
  const CUT = GS + "V" + "\x42" + "\x00"; // Cut paper
  const LINE_FEED = "\n";
  const SEPARATOR = "--------------------------------";

  let receipt = INIT;

  // Header
  receipt += CENTER + BOLD_ON + DOUBLE_HEIGHT;
  receipt += companyInfo.name + LINE_FEED;
  receipt += NORMAL_SIZE + BOLD_OFF;
  receipt += companyInfo.address + LINE_FEED;
  receipt += companyInfo.city + LINE_FEED;
  receipt += `PH: ${companyInfo.phone}` + LINE_FEED;
  receipt += LEFT + LINE_FEED;

  // Receipt details
  receipt += SEPARATOR + LINE_FEED;
  receipt += BOLD_ON + "MEMBERSHIP PAYMENT" + BOLD_OFF + LINE_FEED;
  receipt += SEPARATOR + LINE_FEED;

  receipt += `Receipt ID: ${receiptId}` + LINE_FEED;
  receipt += `Date: ${now.toLocaleDateString()}` + LINE_FEED;
  receipt += `Time: ${now.toLocaleTimeString()}` + LINE_FEED;
  receipt += LINE_FEED;

  // Member details
  receipt += BOLD_ON + "MEMBER DETAILS:" + BOLD_OFF + LINE_FEED;
  receipt += `Name: ${membership.memberDetails.name}` + LINE_FEED;
  receipt += `Member ID: ${membership.memberDetails.memberId}` + LINE_FEED;
  receipt += `Phone: ${membership.memberDetails.phone}` + LINE_FEED;
  receipt += `Plan: ${membership.membershipTypeDetails.name}` + LINE_FEED;
  receipt += LINE_FEED;

  // Payment details
  receipt += BOLD_ON + "PAYMENT DETAILS:" + BOLD_OFF + LINE_FEED;
  receipt += `Amount Paid: $${paymentData.amount}` + LINE_FEED;
  receipt += `Method: ${paymentData.method}` + LINE_FEED;

  if (paymentData.notes) {
    receipt += `Notes: ${paymentData.notes}` + LINE_FEED;
  }

  receipt += LINE_FEED;

  // Membership Details
  receipt += BOLD_ON + "MEMBERSHIP DETAILS:" + BOLD_OFF + LINE_FEED;
  // receipt += `Total Amount: $${membership.amount}` + LINE_FEED;
  // receipt += `Previously Paid: $${membership.amountPaid}` + LINE_FEED;
  // receipt += `This Payment: $${paymentData.amount}` + LINE_FEED;

  const newAmountPaid =
    membership.amountPaid + parseFloat(paymentData.amount.toString());
  const remainingBalance = membership.amount - newAmountPaid;

  // receipt += `New Balance: $${remainingBalance.toFixed(2)}` + LINE_FEED;
  // receipt += LINE_FEED;

  // Membership period
  receipt +=
    `Start Date: ${new Date(membership.startDate).toLocaleDateString()}` +
    LINE_FEED;
  receipt +=
    `End Date: ${new Date(membership.endDate).toLocaleDateString()}` +
    LINE_FEED;
  receipt += LINE_FEED;

  receipt += SEPARATOR + LINE_FEED;
  receipt += CENTER + BOLD_ON;
  receipt += `PAID: ₹${paymentData.amount}` + LINE_FEED;
  if (remainingBalance > 0) {
    receipt += `REMAINING: ₹${remainingBalance.toFixed(2)}` + LINE_FEED;
  } else {
    receipt += "FULLY PAID" + LINE_FEED;
  }
  receipt += BOLD_OFF + LEFT + LINE_FEED;

  // Footer
  receipt += CENTER;
  receipt += "Thank you for your payment!" + LINE_FEED;
  receipt += "Keep this receipt for your records" + LINE_FEED;
  receipt += LINE_FEED + LINE_FEED;
  receipt += LEFT;

  // Cut paper
  receipt += CUT;

  return receipt;
};

/**
 * Generate HTML receipt for fallback printing
 */
export const generateHtmlReceipt = (
  paymentData: PaymentData,
  membership: MembershipData,
  companyInfo: CompanyInfo = DEFAULT_COMPANY_INFO
): string => {
  const newAmountPaid =
    membership.amountPaid + parseFloat(paymentData.amount.toString());
  const remainingBalance = membership.amount - newAmountPaid;

  return `
      <html>
        <head>
          <title>Membership Payment Receipt</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              width: 58mm; 
              margin: 0; 
              padding: 10px;
              background: white;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .separator { border-top: 1px dashed #000; margin: 5px 0; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">${companyInfo.name}</div>
          <div class="center">${companyInfo.address}</div>
          <div class="center">${companyInfo.city}</div>
          <div class="center">Tel: ${companyInfo.phone}</div>
          <br>
          <div class="separator"></div>
          <div class="center bold">MEMBERSHIP PAYMENT</div>
          <div class="separator"></div>
          <div>Receipt ID: RCP-${Date.now()}</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
          <div>Time: ${new Date().toLocaleTimeString()}</div>
          <br>
          <div class="bold">MEMBER DETAILS:</div>
          <div>Name: ${membership.memberDetails.name}</div>
          <div>Member ID: ${membership.memberDetails.memberId}</div>
          <div>Phone: ${membership.memberDetails.phone}</div>
          <div>Plan: ${membership.membershipTypeDetails.name}</div>
          <br>
          <div class="bold">PAYMENT DETAILS:</div>
          <div>Amount Paid: $${paymentData.amount}</div>
          <div>Method: ${paymentData.method}</div>
          ${paymentData.notes ? `<div>Notes: ${paymentData.notes}</div>` : ""}
          <br>
          <div class="bold">MEMBERSHIP DETAILS:</div>
          <br>
          <div>Start Date: ${new Date(membership.startDate).toLocaleDateString()}</div>
          <div>End Date: ${new Date(membership.endDate).toLocaleDateString()}</div>
          <br>
          <div class="separator"></div>
          <div class="center bold" style="font-size: 14px;">PAID: ₹${paymentData.amount}</div>
          ${
            remainingBalance > 0
              ? `<div class="center bold">REMAINING: ₹${remainingBalance.toFixed(2)}</div>`
              : '<div class="center bold">FULLY PAID</div>'
          }
          <div class="separator"></div>
          <br>
          <div class="center">Thank you for your payment!</div>
          <div class="center">Keep this receipt for your records</div>
        </body>
      </html>
    `;
};

/**
 * Print to thermal printer via Web Serial API
 */
export const printThermalReceipt = async (
  paymentData: PaymentData,
  membership: MembershipData,
  companyInfo?: CompanyInfo
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if Web Serial API is supported
    if (!("serial" in navigator)) {
      throw new Error(
        "Web Serial API not supported. Please use Chrome/Edge browser."
      );
    }

    // Generate receipt data
    const receiptData = generateMembershipReceipt(
      paymentData,
      membership,
      companyInfo
    );

    // Request access to serial port (thermal printer)
    const port = await (navigator as any).serial.requestPort({
      filters: [
        // { usbVendorId: 0x09c5 }, // Common thermal printer vendor IDs
        // { usbVendorId: 0x04b8 }, // Epson
        // { usbVendorId: 0x154f }, // Citizen
      ],
    });
    console.log("port", port);

    // Open the port
    await port.open({ baudRate: 9600 });

    // Get writer
    const writer = port.writable.getWriter();

    // Convert receipt data to bytes
    const data = new TextEncoder().encode(receiptData);

    // Write to printer
    await writer.write(data);

    // Close writer and port
    writer.releaseLock();
    await port.close();

    return { success: true };
  } catch (error: any) {
    console.error("Thermal printing error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fallback print using browser's print dialog
 */
export const printHtmlReceipt = (
  paymentData: PaymentData,
  membership: MembershipData,
  companyInfo?: CompanyInfo
): void => {
  const htmlContent = generateHtmlReceipt(paymentData, membership, companyInfo);

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }
};

/**
 * Main print function that tries thermal printing first, then falls back to HTML printing
 */
export const printMembershipReceipt = async (
  paymentData: PaymentData,
  membership: MembershipData,
  companyInfo?: CompanyInfo,
  options: {
    fallbackToHtml?: boolean;
    showFallbackDialog?: boolean;
  } = { fallbackToHtml: true, showFallbackDialog: true }
): Promise<{
  success: boolean;
  method: "thermal" | "html" | "failed";
  error?: string;
}> => {
  // Try thermal printing first
  const thermalResult = await printThermalReceipt(
    paymentData,
    membership,
    companyInfo
  );

  if (thermalResult.success) {
    return { success: true, method: "thermal" };
  }

  // Fallback to HTML printing if enabled
  if (options.fallbackToHtml) {
    try {
      printHtmlReceipt(paymentData, membership, companyInfo);
      return { success: true, method: "html" };
    } catch (error: any) {
      return {
        success: false,
        method: "failed",
        error: `Both thermal and HTML printing failed: ${thermalResult.error}, ${error.message}`,
      };
    }
  }

  return {
    success: false,
    method: "failed",
    error: thermalResult.error,
  };
};
