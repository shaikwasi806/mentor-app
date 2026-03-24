'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Plus, Edit2, Trash2, ArrowLeft, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create states
  const [newSubjTitle, setNewSubjTitle] = useState('');
  const [newSubjDesc, setNewSubjDesc] = useState('');

  // Course Management View states
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

  // Edit states (Generic for Subject, Section, Lesson)
  const [editingItem, setEditingItem] = useState<{type: 'subject' | 'section' | 'lesson', data: any} | null>(null);
  const [editForm, setEditForm] = useState({ 
    title: '', 
    description: '', 
    videoUrl: '', 
    durationSeconds: 0, 
    orderIndex: 0 
  });

  useEffect(() => {
     if (user && user.role !== 'admin') {
         router.push('/dashboard');
     } else if (user?.role === 'admin') {
         fetchSubjects();
     }
  }, [user, router]);

  const fetchSubjects = async () => {
    try {
       const res = await api.get('/courses');
       setSubjects(res.data);
    } catch (e) { 
        console.error(e);
    } finally { 
        setLoading(false); 
    }
  };

  const handleFetchSubjectDetails = async (id: number) => {
     try {
        const res = await api.get(`/courses/${id}`);
        setSelectedSubject(res.data);
     } catch (e) { 
        console.error(e); 
     }
  };

  const handleCreateSubject = async (e: any) => {
    e.preventDefault();
    try {
       await api.post('/admin/subjects', { title: newSubjTitle, description: newSubjDesc });
       setNewSubjTitle('');
       setNewSubjDesc('');
       fetchSubjects();
    } catch (e) {
       console.error(e);
       alert("Error creating subject");
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject? All associated sections and lessons will also be removed.')) return;
    try {
       await api.delete(`/admin/subjects/${id}`);
       if (selectedSubject?.id === id) setSelectedSubject(null);
       fetchSubjects();
    } catch (e) {
       console.error(e);
       alert("Error deleting subject");
    }
  };

  const handleAddSection = async () => {
     const title = prompt("Enter Section Title:");
     if (!title) return;
     try {
        await api.post(`/admin/subjects/${selectedSubject.id}/sections`, { 
            title, 
            orderIndex: selectedSubject.sections.length + 1 
        });
        handleFetchSubjectDetails(selectedSubject.id);
     } catch (e) { 
        console.error(e); 
     }
  };

  const handleAddLesson = async (sectionId: number) => {
     const title = prompt("Enter Lesson Title:");
     const videoUrl = prompt("Enter YouTube Video ID:");
     if (!title || !videoUrl) return;
     
     try {
        await api.post(`/admin/sections/${sectionId}/lessons`, { 
            title, 
            videoUrl, 
            durationSeconds: 0, 
            orderIndex: 1 
        });
        handleFetchSubjectDetails(selectedSubject.id);
     } catch (e) { 
        console.error(e); 
     }
  };

  const handleDeleteSection = async (id: number) => {
     if (!confirm('Delete section and all its lessons?')) return;
     try {
        await api.delete(`/admin/sections/${id}`);
        handleFetchSubjectDetails(selectedSubject.id);
     } catch (e) { 
        console.error(e); 
     }
  };

  const handleDeleteLesson = async (id: number) => {
     if (!confirm('Delete lesson?')) return;
     try {
        await api.delete(`/admin/lessons/${id}`);
        handleFetchSubjectDetails(selectedSubject.id);
     } catch (e) { 
        console.error(e); 
     }
  };

  const handleEditClick = (type: 'subject' | 'section' | 'lesson', data: any) => {
    setEditingItem({ type, data });
    setEditForm({ 
        title: data.title || '', 
        description: data.description || '', 
        videoUrl: data.video_url || '', 
        durationSeconds: data.duration_seconds || 0,
        orderIndex: data.order_index || 0
    });
  };

  const handleUpdateItem = async (e: any) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
       if (editingItem.type === 'subject') {
           await api.put(`/admin/subjects/${editingItem.data.id}`, { 
               title: editForm.title, 
               description: editForm.description 
           });
           fetchSubjects();
       } else if (editingItem.type === 'section') {
           await api.put(`/admin/sections/${editingItem.data.id}`, { 
               title: editForm.title, 
               orderIndex: editForm.orderIndex 
           });
       } else if (editingItem.type === 'lesson') {
           await api.put(`/admin/lessons/${editingItem.data.id}`, { 
               title: editForm.title, 
               videoUrl: editForm.videoUrl, 
               durationSeconds: editForm.durationSeconds, 
               orderIndex: editForm.orderIndex 
           });
       }
       setEditingItem(null);
       if (selectedSubject) handleFetchSubjectDetails(selectedSubject.id);
    } catch (e) {
       console.error(e);
       alert("Error updating item");
    }
  };

  if (loading) return <AppLayout><div className="animate-pulse p-12">Loading Admin Data...</div></AppLayout>;

  return (
    <AppLayout>
       <div className="mb-10 flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage courses, sections, and lessons.</p>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Sidebar: Creation / Editing Form */}
           <div className="lg:col-span-1 border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm self-start sticky top-24">
              {editingItem ? (
                <>
                  <h2 className="font-bold text-lg mb-4">Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}</h2>
                  <form onSubmit={handleUpdateItem} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} required
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    {editingItem.type === 'subject' && (
                        <div>
                         <label className="block text-sm font-medium mb-1">Description</label>
                         <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows={3}
                           className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                    )}
                    {editingItem.type === 'lesson' && (
                        <>
                        <div>
                         <label className="block text-sm font-medium mb-1">YouTube Video ID</label>
                         <input type="text" value={editForm.videoUrl} onChange={(e) => setEditForm({...editForm, videoUrl: e.target.value})}
                           className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                         <input type="number" value={editForm.durationSeconds} onChange={(e) => setEditForm({...editForm, durationSeconds: parseInt(e.target.value)})}
                           className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                        </>
                    )}
                    {(editingItem.type === 'section' || editingItem.type === 'lesson') && (
                        <div>
                         <label className="block text-sm font-medium mb-1">Order Index</label>
                         <input type="number" value={editForm.orderIndex} onChange={(e) => setEditForm({...editForm, orderIndex: parseInt(e.target.value)})}
                           className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        Update
                      </button>
                      <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="font-bold text-lg mb-4">Create New Subject</h2>
                  <form onSubmit={handleCreateSubject} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input type="text" value={newSubjTitle} onChange={(e) => setNewSubjTitle(e.target.value)} required
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea value={newSubjDesc} onChange={(e) => setNewSubjDesc(e.target.value)} rows={3}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mt-2">
                      <Plus className="w-4 h-4" /> Add Subject
                    </button>
                  </form>
                </>
              )}
           </div>

           {/* Main Content Area */}
           <div className="lg:col-span-3 space-y-8">
              {!selectedSubject ? (
                <div className="space-y-4">
                    <h2 className="font-bold text-xl mb-4">Existing Subjects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map(s => (
                            <div key={s.id} className="border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{s.title}</h3>
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditClick('subject', s)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit2 className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteSubject(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{s.description}</p>
                                <button 
                                    onClick={() => handleFetchSubjectDetails(s.id)} 
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-sm font-semibold transition-colors border border-gray-100 dark:border-zinc-800"
                                >
                                    Manage Sections & Lessons
                                </button>
                            </div>
                        ))}
                    </div>
                    {subjects.length === 0 && (
                        <div className="p-20 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl text-center">
                            <p className="text-gray-500 font-medium">No subjects found. Use the form on the left to create your first subject.</p>
                        </div>
                    )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4 mb-2">
                         <button 
                            onClick={() => setSelectedSubject(null)} 
                            className="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors shadow-sm"
                         >
                             <ArrowLeft className="w-5 h-5" />
                         </button>
                         <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-gray-100">{selectedSubject.title}</h2>
                            <p className="text-sm text-gray-500">Management View</p>
                         </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                                Curriculum Structure
                            </h3>
                            <button 
                                onClick={handleAddSection} 
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                            >
                                <Plus className="w-4 h-4" /> Add Section
                            </button>
                        </div>

                        <div className="space-y-8">
                            {selectedSubject.sections.map((sec: any) => (
                                <div key={sec.id} className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 bg-gray-50/30 dark:bg-zinc-950/30 relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                                {sec.order_index}
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{sec.title}</h4>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditClick('section', sec)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-zinc-800"><Edit2 className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteSection(sec.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-zinc-800"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>

                                    <div className="ml-5 space-y-3 border-l-2 border-gray-200 dark:border-zinc-800 pl-8 relative">
                                        {sec.lessons.map((lesson: any) => (
                                            <div key={lesson.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 text-sm shadow-sm group/lesson transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-gray-300 dark:bg-zinc-700 rounded-full group-hover/lesson:bg-blue-500 transition-colors"></div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{lesson.title}</span>
                                                    <span className="text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-gray-400">{lesson.video_url}</span>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                                     <button onClick={() => handleEditClick('lesson', lesson)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                                                     <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => handleAddLesson(sec.id)}
                                            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 p-2 ml-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Add Lesson
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {selectedSubject.sections.length === 0 && (
                                <div className="text-center py-12 bg-gray-50/50 dark:bg-zinc-950/20 rounded-2xl border-2 border-dashed border-gray-100 dark:border-zinc-800">
                                    <p className="text-gray-400 font-medium">No sections added yet. Start by creating your first module/section.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              )}
           </div>
        </div>

    </AppLayout>
  )
}
