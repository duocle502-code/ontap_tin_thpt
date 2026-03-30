import { AppData, QuizSession } from '../types';
import { MOCK_SUBJECTS } from '../data/mockData';

// ============================================================
// Shared Helpers
// ============================================================

function getSubjectName(subjectId: string): string {
  return MOCK_SUBJECTS.find(s => s.id === subjectId)?.name || 'Chủ đề không xác định';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} phút ${s} giây`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ============================================================
// WORD EXPORT  (.docx via HTML → Word blob)
// ============================================================

function buildWordHTML(data: AppData): string {
  const { profile, sessions, progress } = data;

  const sessionRows = sessions.map((s: QuizSession) => `
    <tr>
      <td style="border:1px solid #ccc;padding:8px 12px;">${getSubjectName(s.subjectId)}</td>
      <td style="border:1px solid #ccc;padding:8px 12px;text-align:center;">${formatDate(s.date)}</td>
      <td style="border:1px solid #ccc;padding:8px 12px;text-align:center;">${Math.round(s.score)}%</td>
      <td style="border:1px solid #ccc;padding:8px 12px;text-align:center;">${s.correctAnswers}/${s.totalQuestions}</td>
      <td style="border:1px solid #ccc;padding:8px 12px;text-align:center;">${formatTime(s.timeSpent)}</td>
    </tr>
  `).join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Tiến độ học tập</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Times New Roman', serif; margin: 40px; color: #333; }
        h1 { color: #1e40af; text-align: center; font-size: 26px; margin-bottom: 4px; }
        h2 { color: #1e40af; font-size: 18px; margin-top: 28px; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; }
        .subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 30px; }
        .info-grid { margin: 0 auto 20px; }
        .info-grid td { padding: 5px 16px; }
        .info-label { font-weight: bold; color: #475569; }
        .info-value { color: #1e293b; }
        .stat-table { border-collapse: collapse; width: 100%; margin: 10px 0 20px; }
        .stat-table th { background: #1e40af; color: #fff; padding: 10px 14px; text-align: center; font-size: 13px; }
        .stat-table td { font-size: 13px; }
        .stat-table tr:nth-child(even) { background: #f8fafc; }
        .stats-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 10px 0 20px; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <h1>📊 BÁO CÁO TIẾN ĐỘ HỌC TẬP</h1>
      <p class="subtitle">Ứng dụng ôn tập Tin học THPT — TinhocEdu</p>

      <h2>📋 Thông tin học sinh</h2>
      <table class="info-grid">
        <tr><td class="info-label">Họ và tên:</td><td class="info-value">${profile?.fullName || 'Chưa cập nhật'}</td></tr>
        <tr><td class="info-label">Lớp:</td><td class="info-value">${profile?.className || 'Chưa cập nhật'}</td></tr>
        <tr><td class="info-label">Trường:</td><td class="info-value">${profile?.schoolName || 'Chưa cập nhật'}</td></tr>
        <tr><td class="info-label">Ngày xuất:</td><td class="info-value">${formatDate(new Date().toISOString())}</td></tr>
      </table>

      <h2>📈 Thống kê tổng quan</h2>
      <div class="stats-box">
        <table style="width:100%;">
          <tr>
            <td style="padding:6px 0;"><strong>Tổng lượt làm bài:</strong> ${progress.totalAttempts}</td>
            <td style="padding:6px 0;"><strong>Điểm trung bình:</strong> ${Math.round(progress.averageScore)}%</td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><strong>Chuỗi ngày học:</strong> ${progress.streakDays} ngày</td>
            <td style="padding:6px 0;"><strong>Số chủ đề đã học:</strong> ${new Set(sessions.map(s => s.subjectId)).size}</td>
          </tr>
          ${progress.weakTopics.length > 0 ? `
          <tr>
            <td colspan="2" style="padding:6px 0;"><strong>Chủ đề cần lưu ý:</strong> ${progress.weakTopics.join(', ')}</td>
          </tr>` : ''}
        </table>
      </div>

      <h2>📝 Lịch sử làm bài</h2>
      ${sessions.length > 0 ? `
      <table class="stat-table">
        <thead>
          <tr>
            <th style="text-align:left;">Chủ đề</th>
            <th>Ngày làm</th>
            <th>Điểm số</th>
            <th>Kết quả</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          ${sessionRows}
        </tbody>
      </table>
      ` : '<p style="color:#94a3b8;text-align:center;">Chưa có lịch sử làm bài nào.</p>'}

      <div class="footer">
        <p>Báo cáo được xuất tự động từ ứng dụng TinhocEdu — ${formatDate(new Date().toISOString())}</p>
      </div>
    </body>
    </html>
  `;
}

export function exportToWord(data: AppData): void {
  const html = buildWordHTML(data);
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
  triggerDownload(blob, `tien_do_hoc_tap_${getDateString()}.doc`);
}

// ============================================================
// PDF EXPORT (dynamically loads jsPDF + AutoTable from CDN)
// ============================================================

async function loadJsPDF(): Promise<any> {
  // Check if already loaded
  if ((window as any).jspdf) {
    return (window as any).jspdf;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
    script.onload = () => {
      // Load autotable plugin after jsPDF
      const scriptAT = document.createElement('script');
      scriptAT.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.4/jspdf.plugin.autotable.min.js';
      scriptAT.onload = () => resolve((window as any).jspdf);
      scriptAT.onerror = () => reject(new Error('Không thể tải module tạo PDF'));
      document.head.appendChild(scriptAT);
    };
    script.onerror = () => reject(new Error('Không thể tải module tạo PDF'));
    document.head.appendChild(script);
  });
}

export async function exportToPDF(data: AppData): Promise<void> {
  const jspdf = await loadJsPDF();
  const { jsPDF } = jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { profile, sessions, progress } = data;

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // --- Load Vietnamese-compatible font (use built-in Helvetica with Unicode) ---
  // jsPDF's default fonts don't support Vietnamese. We use a workaround:
  // draw text using built-in font and handle with standard latin where possible.
  
  // Helper: safe text
  const removeVietnamese = (str: string): string => {
    // Normalize Vietnamese characters to closest ASCII equivalent for PDF
    const map: Record<string, string> = {
      'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a',
      'â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a',
      'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e',
      'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
      'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o',
      'ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o',
      'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u',
      'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
      'đ':'d',
      'À':'A','Á':'A','Ả':'A','Ã':'A','Ạ':'A','Ă':'A','Ằ':'A','Ắ':'A','Ẳ':'A','Ẵ':'A','Ặ':'A',
      'Â':'A','Ầ':'A','Ấ':'A','Ẩ':'A','Ẫ':'A','Ậ':'A',
      'È':'E','É':'E','Ẻ':'E','Ẽ':'E','Ẹ':'E','Ê':'E','Ề':'E','Ế':'E','Ể':'E','Ễ':'E','Ệ':'E',
      'Ì':'I','Í':'I','Ỉ':'I','Ĩ':'I','Ị':'I',
      'Ò':'O','Ó':'O','Ỏ':'O','Õ':'O','Ọ':'O','Ô':'O','Ồ':'O','Ố':'O','Ổ':'O','Ỗ':'O','Ộ':'O',
      'Ơ':'O','Ờ':'O','Ớ':'O','Ở':'O','Ỡ':'O','Ợ':'O',
      'Ù':'U','Ú':'U','Ủ':'U','Ũ':'U','Ụ':'U','Ư':'U','Ừ':'U','Ứ':'U','Ử':'U','Ữ':'U','Ự':'U',
      'Ỳ':'Y','Ý':'Y','Ỷ':'Y','Ỹ':'Y','Ỵ':'Y',
      'Đ':'D'
    };
    return str.replace(/[^\x00-\x7F]/g, (char) => map[char] || char);
  };

  // Title
  doc.setFontSize(22);
  doc.setTextColor(30, 64, 175);
  doc.text(removeVietnamese('BAO CAO TIEN DO HOC TAP'), pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(removeVietnamese('Ung dung on tap Tin hoc THPT - TinhocEdu'), pageWidth / 2, y, { align: 'center' });
  y += 14;

  // Student Info
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text(removeVietnamese('Thong tin hoc sinh'), 14, y);
  y += 2;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  const infoLines = [
    [`${removeVietnamese('Ho va ten:')}`, removeVietnamese(profile?.fullName || 'Chua cap nhat')],
    [`${removeVietnamese('Lop:')}`, removeVietnamese(profile?.className || 'Chua cap nhat')],
    [`${removeVietnamese('Truong:')}`, removeVietnamese(profile?.schoolName || 'Chua cap nhat')],
    [`${removeVietnamese('Ngay xuat:')}`, formatDate(new Date().toISOString())],
  ];
  infoLines.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 55, y);
    y += 7;
  });
  y += 6;

  // Stats overview
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text(removeVietnamese('Thong ke tong quan'), 14, y);
  y += 2;
  doc.setDrawColor(59, 130, 246);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Stats box
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, y - 2, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  doc.setFont('helvetica', 'bold');
  doc.text(removeVietnamese(`Tong luot lam bai: `), 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${progress.totalAttempts}`, 72, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(removeVietnamese(`Diem trung binh: `), 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${Math.round(progress.averageScore)}%`, 155, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(removeVietnamese(`Chuoi ngay hoc: `), 20, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(removeVietnamese(`${progress.streakDays} ngay`), 67, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.text(removeVietnamese(`So chu de da hoc: `), 110, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Set(sessions.map(s => s.subjectId)).size}`, 160, y + 16);

  y += 36;

  // Session history table
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text(removeVietnamese('Lich su lam bai'), 14, y);
  y += 2;
  doc.setDrawColor(59, 130, 246);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  if (sessions.length > 0) {
    const tableData = sessions.map(s => [
      removeVietnamese(getSubjectName(s.subjectId)),
      formatDate(s.date),
      `${Math.round(s.score)}%`,
      `${s.correctAnswers}/${s.totalQuestions}`,
      formatTime(s.timeSpent).replace('phút', 'p').replace('giây', 's')
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [[
        removeVietnamese('Chu de'),
        removeVietnamese('Ngay lam'),
        removeVietnamese('Diem so'),
        removeVietnamese('Ket qua'),
        removeVietnamese('Thoi gian')
      ]],
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text(removeVietnamese('Chua co lich su lam bai nao.'), pageWidth / 2, y + 10, { align: 'center' });
  }

  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || y + 20;
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    removeVietnamese(`Bao cao duoc xuat tu dong tu ung dung TinhocEdu - ${formatDate(new Date().toISOString())}`),
    pageWidth / 2,
    Math.min(finalY + 20, doc.internal.pageSize.getHeight() - 10),
    { align: 'center' }
  );

  doc.save(`tien_do_hoc_tap_${getDateString()}.pdf`);
}
