import React from 'react';
import { Subject } from '../types';
import { motion } from 'motion/react';

interface SubjectListProps {
  subjects: Subject[];
  onStart: (subject: Subject) => void;
}

export default function SubjectList({ subjects, onStart }: SubjectListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject, index) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -5, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer group relative overflow-hidden"
          onClick={() => onStart(subject)}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-blue-100 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 shadow-lg shadow-blue-100 group-hover:rotate-6 transition-transform">
              <i className={subject.icon}></i>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 min-h-[3.5rem]">
              {subject.name}
            </h3>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <i className="fa-solid fa-list-check text-blue-400"></i>
                <span>{subject.questionsCount} câu hỏi</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
