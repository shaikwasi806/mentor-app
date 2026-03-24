'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

export default function LessonPage() {
  const { id, lessonId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const playerRef = useRef<any>(null);
  const router = useRouter();
  
  const autoSaveIntervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
        
        let foundLesson = null;
        for (const s of res.data.sections) {
          const l = s.lessons.find((les: any) => les.id === Number(lessonId));
          if (l) foundLesson = l;
        }
        
        if (!foundLesson) router.push(`/course/${id}`);
        setLesson(foundLesson);
        
        if (foundLesson.progress) {
           setProgress(foundLesson.progress.progress_seconds);
           setIsCompleted(foundLesson.progress.is_completed);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourse();
  }, [id, lessonId, router]);

  useEffect(() => {
     if (lesson && !isCompleted) {
        autoSaveIntervalId.current = setInterval(() => {
           if (playerRef.current) {
              const currentSeconds = playerRef.current.getCurrentTime();
              syncProgress(Math.floor(currentSeconds), false);
           }
        }, 10000); // sync every 10s
     }
     
     return () => {
        if (autoSaveIntervalId.current) clearInterval(autoSaveIntervalId.current);
     };
  }, [lesson, isCompleted]);

  const syncProgress = async (seconds: number, completed: boolean) => {
    if (completed) setIsCompleted(true);
    try {
      await api.post(`/courses/progress/${lessonId}`, {
        progressSeconds: seconds,
        isCompleted: completed
      });
    } catch (error) {
       console.error("Failed to save progress", error);
    }
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    if (isCompleted) return;
    
    // Auto complete on 90% watched
    if (state.playedSeconds > lesson.duration_seconds * 0.9) {
      if (!isCompleted) {
         syncProgress(Math.floor(state.playedSeconds), true);
      }
    }
  };

  const handleEnded = () => {
     if (!isCompleted) {
         syncProgress(Math.floor(playerRef.current?.getCurrentTime() || lesson.duration_seconds), true);
     }
  };

  const handleReady = () => {
      if (progress > 0 && !isCompleted && playerRef.current) {
          playerRef.current.seekTo(progress, 'seconds');
      }
  };

  if (!lesson) return <AppLayout><div className="animate-pulse flex items-center justify-center p-12">Loading lesson...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
         <Link href={`/course/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors mb-4 text-sm font-medium">
           <ArrowLeft className="w-4 h-4" /> Back to Course Directory
         </Link>
         <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white flex items-center gap-3">
             {lesson.title}
             {isCompleted && (
               <span title="Completed">
                 <CheckCircle2 className="w-6 h-6 text-emerald-500" />
               </span>
             )}
         </h1>
      </div>

      <div className="w-full bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl mb-8 relative border border-gray-800">
         <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 hover:opacity-100 transition-opacity flex items-end p-6">
           {/* Custom overlay if needed */}
         </div>
         <ReactPlayer
           ref={playerRef}
           url={`https://www.youtube.com/watch?v=${lesson.video_url}`}
           width="100%"
           height="100%"
           controls={true}
           playing={true}
           onProgress={handleProgress as any}
           onEnded={handleEnded}
           onReady={handleReady}
           config={{
             youtube: {
               playerVars: { showinfo: 1 }
             }
            } as any}
         />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-2xl shadow-sm">
         <h3 className="text-xl font-bold mb-4">Lesson Details</h3>
         <div className="flex gap-4">
             <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</span>
                <span className="font-medium text-gray-900 dark:text-zinc-100">{Math.floor(lesson.duration_seconds / 60)} minutes</span>
             </div>
             <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</span>
                <span className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>
                   {isCompleted ? 'Completed' : 'In Progress'}
                </span>
             </div>
         </div>
         <p className="mt-8 text-gray-600 dark:text-zinc-400">
            Make sure to watch at least 90% of the video or reach the end to automatically mark this lesson as completed. Your progress is auto-saved every 10 seconds.
         </p>
      </div>

    </AppLayout>
  );
}
