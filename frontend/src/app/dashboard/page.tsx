'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, PlayCircle, Clock } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

interface Subject {
  id: number;
  title: string;
  description: string;
}

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setSubjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <AppLayout><div className="animate-pulse space-y-6">Loading subjects...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">My Learning Path</h1>
        <p className="text-gray-500 dark:text-zinc-400">Pick up right where you left off or start something new.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link href={`/course/${subject.id}`} key={subject.id} className="group flex flex-col bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 transition-all hover:-translate-y-1">
            <div className="h-40 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
               <BookOpen className="w-12 h-12 text-gray-300 dark:text-zinc-700 group-hover:text-blue-500/50 transition-colors" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{subject.title}</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 mb-6 flex-1">{subject.description}</p>
              
              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100 dark:border-zinc-800 mt-auto">
                 <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                    <PlayCircle className="w-4 h-4" /> Start Course
                 </span>
                 <span className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-4 h-4" /> Go at your pace
                 </span>
              </div>
            </div>
          </Link>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
            No subjects available right now.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
