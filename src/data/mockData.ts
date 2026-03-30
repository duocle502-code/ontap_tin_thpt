import { Subject, Question } from '../types';

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'th10-b1', name: 'Tin học 10 - Bài 1: Thông tin và dữ liệu', icon: 'fa-solid fa-database', questionsCount: 5 },
  { id: 'th10-b2', name: 'Tin học 10 - Bài 2: Vai trò của thiết bị thông minh', icon: 'fa-solid fa-microchip', questionsCount: 5 },
  { id: 'th11-b1', name: 'Tin học 11 - Bài 1: Hệ điều hành', icon: 'fa-solid fa-window-maximize', questionsCount: 5 },
  { id: 'th12-b1', name: 'Tin học 12 - Bài 1: Mạng máy tính', icon: 'fa-solid fa-network-wired', questionsCount: 5 },
  { id: 'thi-giua-ki', name: 'Thi thử giữa kì I', icon: 'fa-solid fa-file-signature', questionsCount: 10 },
  { id: 'thi-cuoi-ki', name: 'Thi thử cuối kì I', icon: 'fa-solid fa-graduation-cap', questionsCount: 15 },
];

export const MOCK_QUESTIONS: Question[] = [
  // Bài 1 Tin 10
  {
    id: 'q1',
    subjectId: 'th10-b1',
    content: 'Đơn vị đo lượng thông tin nhỏ nhất là gì?',
    type: 'multiple-choice',
    options: ['Byte', 'Bit', 'Kilobyte', 'Megabyte'],
    correctAnswer: 1,
    explanation: 'Bit (Binary digit) là đơn vị nhỏ nhất để đo lượng thông tin trong máy tính.',
    difficulty: 'Nhận biết'
  },
  {
    id: 'q2',
    subjectId: 'th10-b1',
    content: '1 Byte bằng bao nhiêu Bit?',
    type: 'multiple-choice',
    options: ['4 Bit', '8 Bit', '16 Bit', '32 Bit'],
    correctAnswer: 1,
    explanation: 'Theo quy ước quốc tế, 1 Byte tương đương với 8 Bit.',
    difficulty: 'Nhận biết'
  },
  {
    id: 'q3',
    subjectId: 'th10-b1',
    content: 'Thông tin sau khi được xử lý bởi máy tính được gọi là gì?',
    type: 'multiple-choice',
    options: ['Dữ liệu đầu vào', 'Dữ liệu đầu ra', 'Phần mềm', 'Phần cứng'],
    correctAnswer: 1,
    explanation: 'Máy tính nhận dữ liệu đầu vào, xử lý và cho ra kết quả là dữ liệu đầu ra.',
    difficulty: 'Thông hiểu'
  },
  {
    id: 'q4',
    subjectId: 'th10-b1',
    content: 'Dữ liệu là gì?',
    type: 'multiple-choice',
    options: [
      'Là những gì con người thu nhận được từ thế giới xung quanh',
      'Là các con số, văn bản, hình ảnh, âm thanh được lưu trữ trong máy tính',
      'Là các chương trình điều khiển máy tính',
      'Là các thiết bị phần cứng của máy tính'
    ],
    correctAnswer: 1,
    explanation: 'Dữ liệu là hình thức thể hiện của thông tin trong máy tính.',
    difficulty: 'Thông hiểu'
  },
  {
    id: 'q5',
    subjectId: 'th10-b1',
    content: 'Nếu một tệp tin có dung lượng 1024 KB, nó tương đương với bao nhiêu MB?',
    type: 'multiple-choice',
    options: ['1 MB', '10 MB', '0.1 MB', '100 MB'],
    correctAnswer: 0,
    explanation: '1 MB = 1024 KB.',
    difficulty: 'Vận dụng'
  },
  // Bài 2 Tin 10
  {
    id: 'q6',
    subjectId: 'th10-b2',
    content: 'Thiết bị nào sau đây được coi là thiết bị thông minh?',
    type: 'multiple-choice',
    options: ['Máy tính bỏ túi cũ', 'Điện thoại thông minh (Smartphone)', 'Bàn là điện thông thường', 'Quạt điện cơ'],
    correctAnswer: 1,
    explanation: 'Smartphone có khả năng xử lý dữ liệu, kết nối mạng và chạy các ứng dụng phức tạp.',
    difficulty: 'Nhận biết'
  },
  // Thi giữa kì
  {
    id: 'q7',
    subjectId: 'thi-giua-ki',
    content: 'Trong hệ nhị phân, số 10 tương ứng với giá trị thập phân nào?',
    type: 'multiple-choice',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1,
    explanation: '10 trong hệ nhị phân = 1*2^1 + 0*2^0 = 2.',
    difficulty: 'Vận dụng'
  },
  {
    id: 'q8',
    subjectId: 'th11-b1',
    content: 'Chức năng chính của hệ điều hành là gì?',
    type: 'multiple-choice',
    options: [
      'Soạn thảo văn bản',
      'Quản lý tài nguyên máy tính và cung cấp môi trường cho người dùng',
      'Thiết kế đồ họa',
      'Kết nối mạng Internet'
    ],
    correctAnswer: 1,
    explanation: 'Hệ điều hành là phần mềm nền tảng quản lý phần cứng và phần mềm khác.',
    difficulty: 'Nhận biết'
  },
  {
    id: 'q9',
    subjectId: 'th12-b1',
    content: 'Giao thức nào được sử dụng phổ biến nhất trên Internet hiện nay?',
    type: 'multiple-choice',
    options: ['HTTP', 'FTP', 'TCP/IP', 'SMTP'],
    correctAnswer: 2,
    explanation: 'TCP/IP là bộ giao thức nền tảng cho mọi hoạt động trên Internet.',
    difficulty: 'Nhận biết'
  },
  {
    id: 'q10',
    subjectId: 'th10-b2',
    content: 'Thiết bị nào sau đây KHÔNG phải là thiết bị vào?',
    type: 'multiple-choice',
    options: ['Bàn phím', 'Chuột', 'Màn hình', 'Máy quét'],
    correctAnswer: 2,
    explanation: 'Màn hình là thiết bị ra (Output device).',
    difficulty: 'Nhận biết'
  }
];
