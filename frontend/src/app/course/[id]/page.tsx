'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Lock, PlayCircle, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

interface Lesson {
  id: number;
  title: string;
  duration_seconds: number;
  progress: {
    progress_seconds: number;
    is_completed: boolean;
  } | null;
}

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  sections: Section[];
}

export default function CoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, router]);

  const handleEnroll = async () => {
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true);
    } catch (err) {
      console.error(err);
      alert('Already enrolled or error enrolling');
    }
  };

  if (loading) return <AppLayout><div className="animate-pulse flex items-center justify-center p-12">Loading course...</div></AppLayout>;
  if (!course) return null;

  // Calculate sequential unlock logic
  let previousLessonCompleted = true;

  return (
    <AppLayout>
       <div className="mb-8">
         <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors mb-6 text-sm font-medium">
           <ArrowLeft className="w-4 h-4" /> Back to Dashboard
         </Link>
         <h1 className="text-4xl font-extrabold tracking-tight mb-4">{course.title}</h1>
         <p className="text-lg text-gray-600 dark:text-zinc-300 max-w-3xl mb-8 leading-relaxed">
           {course.description}
         </p>
         {!enrolled && (
            <button onClick={handleEnroll} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Enroll Now
            </button>
         )}
       </div>

       <div className="space-y-8">
         {course.sections.map((section, sIdx) => (
            <div key={section.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold flex items-center gap-3">
                   <span className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center text-sm text-gray-400 font-medium border border-gray-100 dark:border-zinc-600">
                     {sIdx + 1}
                   </span>
                   {section.title}
                </h2>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                {section.lessons.map((lesson, lIdx) => {
                  const isLocked = !previousLessonCompleted;
                  if (lesson.progress) {
                     previousLessonCompleted = lesson.progress.is_completed;
                  } else {
                     previousLessonCompleted = false;
                  }

                  return (
                    <div key={lesson.id} className={`flex items-center p-6 ${isLocked ? 'opacity-50 pointer-events-none grayscale bg-gray-50 dark:bg-zinc-900/50' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors'}`}>
                      <div className="mr-4">
                        {lesson.progress?.is_completed ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                        ) : isLocked ? (
                          <Lock className="w-7 h-7 text-gray-300 dark:text-zinc-600" />
                        ) : (
                          <PlayCircle className="w-7 h-7 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{lesson.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                          <span>{Math.floor(lesson.duration_seconds / 60)} min {lesson.duration_seconds % 60} sec</span>
                          {lesson.progress && !lesson.progress.is_completed && lesson.progress.progress_seconds > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold shrink-0">
                               {Math.floor((lesson.progress.progress_seconds / lesson.duration_seconds) * 100)}% viewed
                            </span>
                          )}
                        </div>
                      </div>
                      {!isLocked && (
                        <Link href={`/course/${course.id}/lesson/${lesson.id}`} className="px-4 py-2 border-2 border-gray-100 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 text-gray-600 dark:text-zinc-300 rounded-xl font-bold text-sm transition-all focus:ring-4 focus:ring-blue-500/20 active:scale-95">
                          {lesson.progress && lesson.progress.progress_seconds > 0 && !lesson.progress.is_completed ? 'Resume' : 'Start Lesson'}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
         ))}
       </div>
    </AppLayout>
  );
}
