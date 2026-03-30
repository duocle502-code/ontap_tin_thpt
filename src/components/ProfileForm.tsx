import React, { useState } from 'react';
import { UserProfile } from '../types';
import Swal from 'sweetalert2';

interface ProfileFormProps {
  onSave: (profile: UserProfile) => void;
  initialData: UserProfile | null;
}

export default function ProfileForm({ onSave, initialData }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [className, setClassName] = useState(initialData?.className || '');
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !className || !schoolName) {
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }
    onSave({ fullName, className, schoolName });
    Swal.fire('Thành công', 'Hồ sơ đã được lưu!', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</label>
        <div className="relative">
          <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lớp</label>
        <div className="relative">
          <i className="fa-solid fa-users absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="10A1"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trường</label>
        <div className="relative">
          <i className="fa-solid fa-school absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="THPT Kết nối tri thức"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>
      <div className="md:col-span-3 flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          Lưu hồ sơ
        </button>
      </div>
    </form>
  );
}
