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
// Shared HTML Builder (used by both Word and PDF)
// ============================================================

function buildReportHTML(data: AppData, forPDF: boolean = false): string {
  const { profile, sessions, progress } = data;

  const sessionRows = sessions.map((s: QuizSession, idx: number) => `
    <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="border:1px solid #e2e8f0;padding:8px 12px;font-size:13px;">${getSubjectName(s.subjectId)}</td>
      <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center;font-size:13px;">${formatDate(s.date)}</td>
      <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center;font-size:13px;font-weight:bold;color:${s.score >= 80 ? '#16a34a' : s.score >= 50 ? '#ea580c' : '#dc2626'};">${Math.round(s.score)}%</td>
      <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center;font-size:13px;">${s.correctAnswers}/${s.totalQuestions}</td>
      <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center;font-size:13px;">${formatTime(s.timeSpent)}</td>
    </tr>
  `).join('');

  const pageStyle = forPDF ? `
    @page { size: A4; margin: 15mm; }
    body { width: 210mm; margin: 0 auto; }
  ` : '';

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
        ${pageStyle}
        * { box-sizing: border-box; }
        body { font-family: 'Times New Roman', 'Be Vietnam Pro', Arial, serif; margin: 40px; color: #333; line-height: 1.6; }
        h1 { color: #1e40af; text-align: center; font-size: 24px; margin-bottom: 4px; }
        h2 { color: #1e40af; font-size: 16px; margin-top: 28px; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; }
        .subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 30px; }
        .info-grid { margin: 10px 0 20px; }
        .info-grid td { padding: 5px 16px; font-size: 13px; }
        .info-label { font-weight: bold; color: #475569; }
        .info-value { color: #1e293b; }
        .stat-table { border-collapse: collapse; width: 100%; margin: 10px 0 20px; }
        .stat-table th { background: #1e40af; color: #fff; padding: 10px 14px; text-align: center; font-size: 13px; border: 1px solid #1e40af; }
        .stat-table td { font-size: 13px; }
        .stats-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; margin: 10px 0 20px; }
        .stats-inner td { padding: 6px 12px; font-size: 13px; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
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
        <table class="stats-inner" style="width:100%;">
          <tr>
            <td><strong>Tổng lượt làm bài:</strong> ${progress.totalAttempts}</td>
            <td><strong>Điểm trung bình:</strong> ${Math.round(progress.averageScore)}%</td>
          </tr>
          <tr>
            <td><strong>Chuỗi ngày học:</strong> ${progress.streakDays} ngày</td>
            <td><strong>Số chủ đề đã học:</strong> ${new Set(sessions.map(s => s.subjectId)).size}</td>
          </tr>
          ${progress.weakTopics.length > 0 ? `
          <tr>
            <td colspan="2"><strong>Chủ đề cần lưu ý:</strong> ${progress.weakTopics.join(', ')}</td>
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
      ` : '<p style="color:#94a3b8;text-align:center;font-style:italic;">Chưa có lịch sử làm bài nào.</p>'}

      <div class="footer">
        <p>Báo cáo được xuất tự động từ ứng dụng TinhocEdu — ${formatDate(new Date().toISOString())}</p>
      </div>
    </body>
    </html>
  `;
}

// ============================================================
// WORD EXPORT  (.doc via HTML → Word blob)
// ============================================================

export function exportToWord(data: AppData): void {
  const html = buildReportHTML(data, false);
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
  triggerDownload(blob, `tien_do_hoc_tap_${getDateString()}.doc`);
}

// ============================================================
// PDF EXPORT (uses browser print-to-PDF via hidden iframe)
// ============================================================

export async function exportToPDF(data: AppData): Promise<void> {
  const html = buildReportHTML(data, true);

  // Create a hidden iframe to render the HTML and trigger print/save as PDF
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  return new Promise<void>((resolve, reject) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Không thể tạo nội dung PDF');
      }

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Wait for content to fully render, then trigger print dialog
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Clean up after a delay
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch (printErr) {
          document.body.removeChild(iframe);
          reject(printErr);
        }
      }, 500);
    } catch (err) {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      reject(err);
    }
  });
}
