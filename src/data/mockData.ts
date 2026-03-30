import { Subject, Question } from '../types';

// ============================================================
// DANH SÁCH CHỦ ĐỀ ÔN TẬP — SGK KẾT NỐI TRI THỨC
// ============================================================

export const MOCK_SUBJECTS: Subject[] = [
  // ======================== TIN HỌC 10 ========================
  {
    id: 'th10-c1',
    name: 'Tin 10 - Chương 1: Thông tin và dữ liệu',
    icon: 'fa-solid fa-database',
    questionsCount: 50,
    grade: '10',
    topicDescription: `Chương 1: Thông tin và dữ liệu (SGK Tin học 10 - Kết nối tri thức)
- Khái niệm thông tin, dữ liệu; phân biệt thông tin và dữ liệu
- Đơn vị đo thông tin: bit, byte, KB, MB, GB, TB
- Biểu diễn thông tin trong máy tính: số hóa thông tin
- Hệ đếm: nhị phân (cơ số 2), thập phân (cơ số 10), thập lục phân (cơ số 16)
- Chuyển đổi giữa các hệ đếm
- Biểu diễn số nguyên, số thực trong máy tính
- Biểu diễn văn bản: bảng mã ASCII, Unicode
- Biểu diễn hình ảnh: pixel, độ phân giải 
- Biểu diễn âm thanh: tần số lấy mẫu, độ sâu bit`
  },
  {
    id: 'th10-c2',
    name: 'Tin 10 - Chương 2: Máy tính và thiết bị thông minh',
    icon: 'fa-solid fa-microchip',
    questionsCount: 50,
    grade: '10',
    topicDescription: `Chương 2: Máy tính và thiết bị thông minh (SGK Tin học 10 - Kết nối tri thức)
- Vai trò, chức năng của máy tính
- Các thành phần chính của máy tính: CPU, RAM, ROM, ổ cứng, mainboard
- Thiết bị vào (input): bàn phím, chuột, máy quét, webcam, micro
- Thiết bị ra (output): màn hình, máy in, loa
- Phần mềm: phần mềm hệ thống, phần mềm ứng dụng
- Hệ điều hành: khái niệm, vai trò, các hệ điều hành phổ biến (Windows, macOS, Linux, Android, iOS)
- Thiết bị thông minh: smartphone, tablet, smartwatch, IoT
- Xu hướng phát triển của công nghệ máy tính`
  },
  {
    id: 'th10-c3',
    name: 'Tin 10 - Chương 3: Đạo đức, pháp luật và văn hóa số',
    icon: 'fa-solid fa-scale-balanced',
    questionsCount: 50,
    grade: '10',
    topicDescription: `Chương 3: Đạo đức, pháp luật và văn hóa trong môi trường số (SGK Tin học 10 - Kết nối tri thức)
- Khái niệm môi trường số, công dân số
- Quyền sở hữu trí tuệ trong môi trường số
- Bản quyền phần mềm: phần mềm thương mại, phần mềm mã nguồn mở, phần mềm miễn phí
- An toàn thông tin cá nhân trên Internet
- Tác hại của việc sử dụng Internet không đúng cách
- Luật pháp về an ninh mạng tại Việt Nam
- Ứng xử văn minh trên mạng xã hội
- Bảo vệ sức khỏe khi sử dụng thiết bị công nghệ`
  },
  {
    id: 'th10-c4',
    name: 'Tin 10 - Chương 4: Ứng dụng tin học',
    icon: 'fa-solid fa-file-word',
    questionsCount: 50,
    grade: '10',
    topicDescription: `Chương 4: Ứng dụng tin học (SGK Tin học 10 - Kết nối tri thức)
- Phần mềm soạn thảo văn bản: Microsoft Word, Google Docs
  + Định dạng văn bản, đoạn văn, trang
  + Chèn bảng biểu, hình ảnh
  + Header/Footer, đánh số trang
- Phần mềm bảng tính: Microsoft Excel, Google Sheets
  + Khái niệm ô, hàng, cột, bảng tính
  + Hàm cơ bản: SUM, AVERAGE, COUNT, MAX, MIN, IF
  + Sắp xếp, lọc dữ liệu
  + Biểu đồ cơ bản
- Phần mềm trình chiếu: Microsoft PowerPoint, Google Slides
  + Tạo slide, chèn nội dung
  + Hiệu ứng chuyển slide, animation
- Sử dụng Internet an toàn: email, tìm kiếm thông tin`
  },
  {
    id: 'th10-c5',
    name: 'Tin 10 - Chương 5: Giải quyết vấn đề & Thuật toán',
    icon: 'fa-solid fa-sitemap',
    questionsCount: 50,
    grade: '10',
    topicDescription: `Chương 5: Giải quyết vấn đề với sự trợ giúp của máy tính (SGK Tin học 10 - Kết nối tri thức)
- Khái niệm bài toán, thuật toán
- Các bước giải quyết bài toán trên máy tính
- Mô tả thuật toán: liệt kê, sơ đồ khối (flowchart)
- Thuật toán tìm giá trị lớn nhất, nhỏ nhất
- Thuật toán tìm kiếm tuần tự
- Thuật toán sắp xếp đơn giản (sắp xếp nổi bọt, sắp xếp chọn)
- Độ phức tạp thuật toán (khái niệm cơ bản)
- Phân tích bài toán thực tế và xây dựng thuật toán`
  },
  {
    id: 'th10-c6',
    name: 'Tin 10 - Chương 6: Lập trình Python cơ bản',
    icon: 'fa-brands fa-python',
    questionsCount: 50,
    grade: '10',
    topicDescription: `Chương 6: Lập trình cơ bản bằng Python (SGK Tin học 10 - Kết nối tri thức)
- Giới thiệu ngôn ngữ lập trình Python
- Biến, kiểu dữ liệu: int, float, str, bool
- Các phép toán số học: +, -, *, /, //, %, **
- Phép toán so sánh và logic: ==, !=, <, >, <=, >=, and, or, not
- Hàm input(), print(), type(), int(), float(), str()
- Câu lệnh điều kiện: if, if-else, if-elif-else
- Vòng lặp: for, while, range()
- Câu lệnh break, continue
- Chuỗi ký tự: truy cập, cắt, nối, các phương thức chuỗi
- Danh sách (list): tạo, truy cập, thêm, xóa phần tử
- Viết chương trình giải quyết bài toán đơn giản`
  },

  // ======================== TIN HỌC 11 ========================
  {
    id: 'th11-c1',
    name: 'Tin 11 - Chương 1: Kỹ thuật lập trình',
    icon: 'fa-solid fa-code',
    questionsCount: 50,
    grade: '11',
    topicDescription: `Chương 1: Kỹ thuật lập trình (SGK Tin học 11 - Kết nối tri thức)
- Hàm (function) trong Python: định nghĩa, gọi hàm, tham số, giá trị trả về
- Biến cục bộ, biến toàn cục
- Hàm đệ quy: khái niệm, ví dụ (giai thừa, Fibonacci)
- Xử lý chuỗi nâng cao: split(), join(), find(), replace(), format()
- Xử lý danh sách nâng cao: list comprehension, sort(), sorted()
- Tuple và Dictionary trong Python
- Xử lý ngoại lệ: try-except
- Module và thư viện: import, from...import
- Đọc/ghi file: open(), read(), write(), close(), with`
  },
  {
    id: 'th11-c2',
    name: 'Tin 11 - Chương 2: Thuật toán sắp xếp & Tìm kiếm',
    icon: 'fa-solid fa-sort',
    questionsCount: 50,
    grade: '11',
    topicDescription: `Chương 2: Thuật toán sắp xếp và tìm kiếm (SGK Tin học 11 - Kết nối tri thức)
- Thuật toán sắp xếp nổi bọt (Bubble Sort): ý tưởng, mã giả, code Python, độ phức tạp
- Thuật toán sắp xếp chèn (Insertion Sort): ý tưởng, mã giả, code Python, độ phức tạp
- Thuật toán sắp xếp chọn (Selection Sort): ý tưởng, mã giả, code Python, độ phức tạp
- So sánh các thuật toán sắp xếp
- Thuật toán tìm kiếm tuần tự (Linear Search)
- Thuật toán tìm kiếm nhị phân (Binary Search): điều kiện, ý tưởng, code
- So sánh tìm kiếm tuần tự và nhị phân
- Độ phức tạp thời gian: O(n), O(n²), O(log n)`
  },
  {
    id: 'th11-c3',
    name: 'Tin 11 - Chương 3: Cơ sở dữ liệu',
    icon: 'fa-solid fa-server',
    questionsCount: 50,
    grade: '11',
    topicDescription: `Chương 3: Cơ sở dữ liệu (SGK Tin học 11 - Kết nối tri thức)
- Khái niệm cơ sở dữ liệu (CSDL), hệ quản trị CSDL (DBMS)
- Ưu điểm của CSDL so với quản lý file thông thường
- Mô hình cơ sở dữ liệu quan hệ: bảng, hàng, cột, trường, bản ghi
- Khóa chính (Primary Key), khóa ngoại (Foreign Key)
- Mối quan hệ giữa các bảng: một-một, một-nhiều, nhiều-nhiều
- Ngôn ngữ truy vấn SQL cơ bản:
  + SELECT, FROM, WHERE
  + INSERT INTO, UPDATE, DELETE
  + ORDER BY, GROUP BY, HAVING
  + Các hàm: COUNT, SUM, AVG, MAX, MIN
- Thiết kế cơ sở dữ liệu: xác định thực thể, thuộc tính, mối quan hệ`
  },
  {
    id: 'th11-c4',
    name: 'Tin 11 - Chương 4: Hệ điều hành & Phần mềm',
    icon: 'fa-solid fa-window-maximize',
    questionsCount: 50,
    grade: '11',
    topicDescription: `Chương 4: Hệ điều hành và phần mềm (SGK Tin học 11 - Kết nối tri thức)
- Hệ điều hành: khái niệm, chức năng chính
- Quản lý tệp và thư mục: tạo, xóa, sao chép, di chuyển, đổi tên
- Cấu trúc cây thư mục, đường dẫn tuyệt đối và tương đối
- Phân loại phần mềm: hệ thống, ứng dụng, tiện ích
- Cài đặt và gỡ bỏ phần mềm
- Phần mềm mã nguồn mở vs phần mềm thương mại
- An toàn thông tin: virus, malware, phần mềm diệt virus
- Sao lưu và phục hồi dữ liệu
- Quyền truy cập file và bảo mật hệ thống`
  },
  {
    id: 'th11-c5',
    name: 'Tin 11 - Chương 5: Mạng máy tính & An toàn thông tin',
    icon: 'fa-solid fa-shield-halved',
    questionsCount: 50,
    grade: '11',
    topicDescription: `Chương 5: Mạng máy tính và an toàn thông tin (SGK Tin học 11 - Kết nối tri thức)
- Khái niệm mạng máy tính, lợi ích của mạng
- Phân loại mạng: LAN, WAN, MAN, Internet
- Các thiết bị mạng: hub, switch, router, modem, access point
- Giao thức mạng: TCP/IP, HTTP, HTTPS, FTP, SMTP, DNS
- Mô hình OSI 7 tầng (khái niệm cơ bản)
- Địa chỉ IP (IPv4): cấu trúc, các lớp địa chỉ
- An toàn khi sử dụng Internet
- Mã hóa thông tin: khái niệm, mật mã đối xứng và bất đối xứng
- Chữ ký số, chứng thư số`
  },

  // ======================== TIN HỌC 12 ========================
  {
    id: 'th12-c1',
    name: 'Tin 12 - Chương 1: Mạng máy tính & Internet',
    icon: 'fa-solid fa-network-wired',
    questionsCount: 50,
    grade: '12',
    topicDescription: `Chương 1: Mạng máy tính và Internet (SGK Tin học 12 - Kết nối tri thức)
- Mạng máy tính: phân loại mạng (LAN, WAN, MAN, PAN)
- Mô hình mạng: client-server, peer-to-peer
- Phương tiện truyền dẫn: cáp đồng, cáp quang, sóng vô tuyến
- Mô hình TCP/IP: tầng ứng dụng, tầng giao vận, tầng mạng, tầng liên kết
- Mô hình OSI 7 tầng
- Giao thức mạng: TCP, UDP, IP, HTTP, HTTPS, FTP, SMTP, DNS, DHCP
- Địa chỉ IP (IPv4, IPv6), subnet mask
- Tên miền (domain name), DNS
- Các dịch vụ Internet: WWW, Email, FTP, Cloud Computing
- Internet of Things (IoT)`
  },
  {
    id: 'th12-c2',
    name: 'Tin 12 - Chương 2: Thiết kế trang web (HTML/CSS)',
    icon: 'fa-solid fa-code',
    questionsCount: 50,
    grade: '12',
    topicDescription: `Chương 2: Thiết kế và xây dựng trang web (SGK Tin học 12 - Kết nối tri thức)
- Khái niệm trang web, website, web server, trình duyệt
- Ngôn ngữ HTML: cấu trúc trang web
  + Thẻ cơ bản: <html>, <head>, <body>, <title>
  + Thẻ tiêu đề: <h1> đến <h6>
  + Thẻ đoạn văn: <p>, <br>, <hr>
  + Thẻ định dạng: <b>, <i>, <u>, <strong>, <em>
  + Thẻ liên kết: <a href="">
  + Thẻ hình ảnh: <img src="">
  + Thẻ danh sách: <ul>, <ol>, <li>
  + Thẻ bảng: <table>, <tr>, <td>, <th>
  + Thẻ biểu mẫu: <form>, <input>, <select>, <textarea>, <button>
- CSS cơ bản: selector, property, value
  + Màu sắc, font chữ, background
  + Box model: margin, padding, border
  + CSS inline, internal, external
- Thiết kế trang web đơn giản`
  },
  {
    id: 'th12-c3',
    name: 'Tin 12 - Chương 3: Trí tuệ nhân tạo (AI)',
    icon: 'fa-solid fa-robot',
    questionsCount: 50,
    grade: '12',
    topicDescription: `Chương 3: Trí tuệ nhân tạo (SGK Tin học 12 - Kết nối tri thức)
- Khái niệm trí tuệ nhân tạo (AI)
- Lịch sử phát triển của AI: từ Alan Turing đến học sâu
- Các nhánh của AI: học máy (Machine Learning), xử lý ngôn ngữ tự nhiên, thị giác máy tính
- Học máy (Machine Learning):
  + Học có giám sát (Supervised Learning): phân loại, hồi quy
  + Học không giám sát (Unsupervised Learning): phân cụm
  + Học tăng cường (Reinforcement Learning)
- Mạng nơ-ron nhân tạo, học sâu (Deep Learning)
- Ứng dụng AI trong đời sống: nhận dạng khuôn mặt, trợ lý ảo, xe tự lái, y tế, giáo dục
- Đạo đức và thách thức của AI
- AI tạo sinh (Generative AI): ChatGPT, AI tạo hình ảnh`
  },
  {
    id: 'th12-c4',
    name: 'Tin 12 - Chương 4: Dữ liệu lớn (Big Data)',
    icon: 'fa-solid fa-chart-bar',
    questionsCount: 50,
    grade: '12',
    topicDescription: `Chương 4: Dữ liệu lớn - Big Data (SGK Tin học 12 - Kết nối tri thức)
- Khái niệm dữ liệu lớn (Big Data)
- Đặc trưng 5V: Volume (khối lượng), Velocity (tốc độ), Variety (đa dạng), Veracity (độ tin cậy), Value (giá trị)
- Nguồn sinh dữ liệu lớn: mạng xã hội, IoT, giao dịch trực tuyến, cảm biến
- Phân biệt dữ liệu có cấu trúc, bán cấu trúc, phi cấu trúc
- Công nghệ xử lý dữ liệu lớn: Hadoop, Spark (giới thiệu)
- Quy trình xử lý dữ liệu lớn: thu thập, lưu trữ, phân tích, trực quan hóa
- Ứng dụng Big Data: kinh doanh, y tế, giao thông, giáo dục, nông nghiệp
- Thách thức: bảo mật, quyền riêng tư, chi phí lưu trữ
- Mối liên hệ giữa Big Data, AI và IoT`
  },
  {
    id: 'th12-c5',
    name: 'Tin 12 - Chương 5: IoT & Điện toán đám mây',
    icon: 'fa-solid fa-cloud',
    questionsCount: 50,
    grade: '12',
    topicDescription: `Chương 5: Internet vạn vật (IoT) và Điện toán đám mây (SGK Tin học 12 - Kết nối tri thức)
- Internet vạn vật (IoT): khái niệm, định nghĩa
- Kiến trúc hệ thống IoT: cảm biến, thiết bị, kết nối, xử lý dữ liệu
- Các giao thức IoT: MQTT, CoAP, Zigbee, Bluetooth LE
- Ứng dụng IoT: nhà thông minh, thành phố thông minh, nông nghiệp thông minh, y tế, công nghiệp 4.0
- Thách thức của IoT: bảo mật, tương thích, năng lượng
- Điện toán đám mây (Cloud Computing): khái niệm
- Mô hình dịch vụ: IaaS, PaaS, SaaS
- Mô hình triển khai: public cloud, private cloud, hybrid cloud
- Ưu điểm và hạn chế của điện toán đám mây
- Các nhà cung cấp: Google Cloud, AWS, Microsoft Azure`
  },
  {
    id: 'th12-c6',
    name: 'Tin 12 - Chương 6: An ninh mạng & Bảo mật',
    icon: 'fa-solid fa-lock',
    questionsCount: 50,
    grade: '12',
    topicDescription: `Chương 6: An ninh mạng và bảo mật thông tin (SGK Tin học 12 - Kết nối tri thức)
- Khái niệm an ninh mạng, bảo mật thông tin
- Các nguy cơ an ninh mạng: virus, worm, trojan, ransomware, spyware, adware
- Tấn công mạng phổ biến: phishing, DDoS, man-in-the-middle, SQL injection, XSS
- Biện pháp phòng chống: tường lửa (firewall), phần mềm diệt virus, cập nhật hệ thống
- Mật khẩu an toàn: quy tắc đặt mật khẩu mạnh, xác thực 2 yếu tố (2FA)
- Mã hóa dữ liệu: mã hóa đối xứng (AES), mã hóa bất đối xứng (RSA)
- Chữ ký số và chứng thư số
- Sao lưu dữ liệu: quy tắc 3-2-1
- Luật An ninh mạng Việt Nam
- An toàn thông tin cá nhân trên mạng xã hội`
  },

  // ======================== THI THỬ ========================
  { 
    id: 'thi-giua-ki', 
    name: 'Thi thử giữa kì I', 
    icon: 'fa-solid fa-file-signature', 
    questionsCount: 10,
    grade: 'all',
    topicDescription: 'Đề thi tổng hợp giữa kì I'
  },
  { 
    id: 'thi-cuoi-ki', 
    name: 'Thi thử cuối kì I', 
    icon: 'fa-solid fa-graduation-cap', 
    questionsCount: 15,
    grade: 'all',
    topicDescription: 'Đề thi tổng hợp cuối kì I'
  },
];

// ============================================================
// CÂU HỎI MẪU (FALLBACK khi không có API Key)
// ============================================================

export const MOCK_QUESTIONS: Question[] = [
  // Tin 10 - Chương 1
  {
    id: 'q1',
    subjectId: 'th10-c1',
    content: 'Đơn vị đo lượng thông tin nhỏ nhất là gì?',
    type: 'multiple-choice',
    options: ['Byte', 'Bit', 'Kilobyte', 'Megabyte'],
    correctAnswer: 1,
    explanation: 'Bit (Binary digit) là đơn vị nhỏ nhất để đo lượng thông tin trong máy tính.',
    difficulty: 'Nhận biết'
  },
  {
    id: 'q2',
    subjectId: 'th10-c1',
    content: '1 Byte bằng bao nhiêu Bit?',
    type: 'multiple-choice',
    options: ['4 Bit', '8 Bit', '16 Bit', '32 Bit'],
    correctAnswer: 1,
    explanation: 'Theo quy ước quốc tế, 1 Byte tương đương với 8 Bit.',
    difficulty: 'Nhận biết'
  },
  {
    id: 'q3',
    subjectId: 'th10-c1',
    content: 'Thông tin sau khi được xử lý bởi máy tính được gọi là gì?',
    type: 'multiple-choice',
    options: ['Dữ liệu đầu vào', 'Dữ liệu đầu ra', 'Phần mềm', 'Phần cứng'],
    correctAnswer: 1,
    explanation: 'Máy tính nhận dữ liệu đầu vào, xử lý và cho ra kết quả là dữ liệu đầu ra.',
    difficulty: 'Thông hiểu'
  },
  {
    id: 'q4',
    subjectId: 'th10-c1',
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
    subjectId: 'th10-c1',
    content: 'Nếu một tệp tin có dung lượng 1024 KB, nó tương đương với bao nhiêu MB?',
    type: 'multiple-choice',
    options: ['1 MB', '10 MB', '0.1 MB', '100 MB'],
    correctAnswer: 0,
    explanation: '1 MB = 1024 KB.',
    difficulty: 'Vận dụng'
  },
  // Tin 10 - Chương 2
  {
    id: 'q6',
    subjectId: 'th10-c2',
    content: 'Thiết bị nào sau đây được coi là thiết bị thông minh?',
    type: 'multiple-choice',
    options: ['Máy tính bỏ túi cũ', 'Điện thoại thông minh (Smartphone)', 'Bàn là điện thông thường', 'Quạt điện cơ'],
    correctAnswer: 1,
    explanation: 'Smartphone có khả năng xử lý dữ liệu, kết nối mạng và chạy các ứng dụng phức tạp.',
    difficulty: 'Nhận biết'
  },
  {
    id: 'q10',
    subjectId: 'th10-c2',
    content: 'Thiết bị nào sau đây KHÔNG phải là thiết bị vào?',
    type: 'multiple-choice',
    options: ['Bàn phím', 'Chuột', 'Màn hình', 'Máy quét'],
    correctAnswer: 2,
    explanation: 'Màn hình là thiết bị ra (Output device).',
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
  // Tin 11
  {
    id: 'q8',
    subjectId: 'th11-c4',
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
  // Tin 12
  {
    id: 'q9',
    subjectId: 'th12-c1',
    content: 'Giao thức nào được sử dụng phổ biến nhất trên Internet hiện nay?',
    type: 'multiple-choice',
    options: ['HTTP', 'FTP', 'TCP/IP', 'SMTP'],
    correctAnswer: 2,
    explanation: 'TCP/IP là bộ giao thức nền tảng cho mọi hoạt động trên Internet.',
    difficulty: 'Nhận biết'
  },
];
