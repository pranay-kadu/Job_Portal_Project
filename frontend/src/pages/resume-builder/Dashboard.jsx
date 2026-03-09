import { FilePenLineIcon, PencilIcon, PlusIcon, Share2Icon, TrashIcon, UploadCloud, UploadCloudIcon, XIcon, LayoutTemplate, Sparkles, Download } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"]
  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')

  const navigate = useNavigate()

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/ai/resumes');
      if (data.resumes) {
        setAllResumes(data.resumes);
      }
    } catch (error) {
      console.log('Error loading resumes:', error.message);
    }
  }

  const createResume = async (event) => {
    event.preventDefault()
    if (!title.trim()) return;
    try {
      const { data } = await api.post('/ai/create-resume', { title });
      if (data.resume) {
        toast.success('Resume created!');
        setShowCreateResume(false);
        setTitle('');
        // Add new resume to the list and navigate to builder
        setAllResumes(prev => [...prev, data.resume]);
        navigate(`/resume-builder/builder/${data.resume._id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to create resume');
    }
  }

  const uploadResume = async (event) => {
    event.preventDefault()
    if (!resume) {
      toast.error("Please select a resume file");
      return;
    }

    setShowUploadResume(false)
    const loadingToast = toast.loading('AI is parsing your resume...');

    try {
      const formData = new FormData();
      formData.append('file', resume);
      formData.append('title', title || 'Uploaded Resume');

      const { data } = await api.post('/ai/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.resumeId) {
        toast.dismiss(loadingToast);
        toast.success(data.message || 'Resume parsed successfully!');
        setTitle('');
        setResume(null);
        navigate(`/resume-builder/builder/${data.resumeId}`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to parse resume');
    }
  }

  const editTitle = async (event) => {
    event.preventDefault()
    try {
      await api.put('/ai/update-resume', {
        resumeId: editResumeId,
        resumeData: { Title: title }
      });
      setAllResumes(prev => prev.map(r => r._id === editResumeId ? { ...r, Title: title } : r))
      toast.success('Title updated!');
      setEditResumeId('');
      setTitle('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update title');
    }
  }

  const handleDeleteResume = async (resumeId) => {
    const confirm = window.confirm('Are you sure want to delete this resume?')
    if (confirm) {
      try {
        await api.delete(`/ai/delete-resume/${resumeId}`);
        setAllResumes(prev => prev.filter(resume => resume._id !== resumeId));
        toast.success('Resume deleted!');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete resume');
      }
    }
  }

  useEffect(() => {
    loadAllResumes()
  }, [])

  const handleCardShare = (resumeId) => {
    const frontendUrl = window.location.href.split('/resume-builder')[0];
    const resumeUrl = frontendUrl + '/resume-builder/view/' + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeUrl, title: "My Resume", text: "Check out my resume!" })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(resumeUrl);
      toast.success('Link copied to clipboard!');
    }
  }

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 pt-4 pb-8'>
        <div className="flex flex-col mt-8 space-y-8 items-center text-center">
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Land your dream job with <br className="hidden md:block" />
              <span className="text-blue-600">AI-powered</span> resumes.
            </h2>
            <p className="text-gray-600 text-lg">
              Create, edit and download professional resumes with <br className="hidden md:block" />
              AI-powered assistance.
            </p>
          </div>
        </div>

        <div className="bg-[#6B7280]/5 rounded-3xl p-8 md:p-12 mt-12 mb-16 max-w-5xl mx-auto border border-[#6B7280]/20 shadow-sm">
          <div className='flex gap-6 justify-center flex-wrap'>
            <button onClick={() => setShowCreateResume(true)} className='w-full bg-white sm:max-w-64 h-64 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <PlusIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
              <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Create Resume</p>
            </button>
            <button onClick={() => setShowUploadResume(true)} className='w-full bg-white sm:max-w-64 h-64 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <UploadCloudIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full' />
              <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>Upload Existing</p>
            </button>
          </div>
        </div>

        <div className="bg-[#6B7280]/5 rounded-3xl p-8 md:p-12 mb-20 max-w-5xl mx-auto border border-[#6B7280]/20 shadow-sm">
          {allResumes.length > 0 && <p className='text-2xl font-bold mb-8 text-slate-700 text-center tracking-wide'>My Resumes</p>}
          <div className='flex gap-4 overflow-x-auto pb-8 scrollbar-hide flex-wrap justify-center'>
            {allResumes.map((resume, index) => {
              const baseColor = colors[index % colors.length];
              return (
                <button key={resume._id || index} onClick={() => navigate(`/resume-builder/builder/${resume._id}`)} className='relative w-full sm:max-w-56 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer' style={{ background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`, borderColor: baseColor + '40' }}>
                  <FilePenLineIcon className='size-7 group-hover:scale-105 transition-all ' style={{ color: baseColor }} />
                  <p className='text-sm group-hover:scale-105 transition-all px-2 text-center font-medium' style={{ color: baseColor }}>{resume.Title || resume.title}</p>
                  <p className='absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center' style={{ color: baseColor + '90' }}> Updated on {new Date(resume.updatedAt).toLocaleDateString()}</p>
                  <div onClick={e => e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
                    <TrashIcon onClick={() => handleDeleteResume(resume._id)} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors' />
                    <PencilIcon onClick={() => { setEditResumeId(resume._id); setTitle(resume.Title || resume.title) }} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors' />
                    <Share2Icon onClick={() => handleCardShare(resume._id)} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors' />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-8 max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 tracking-wide md:text-center">How it works?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl p-8 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-slate-100">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <LayoutTemplate className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-3 tracking-tight">Select Template</h4>
              <p className="text-slate-600 text-[15px] leading-relaxed">Choose from professionally designed modern resume layouts.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-slate-100">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-3 tracking-tight">Fill & AI Enhance</h4>
              <p className="text-slate-600 text-[15px] leading-relaxed">Enter your details and let AI enhance your professional summary.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-slate-100">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-3 tracking-tight">Download & Share</h4>
              <p className="text-slate-600 text-[15px] leading-relaxed">Instantly download your resume as a PDF or share it publicly.</p>
            </div>
          </div>
        </div>

        {
          showCreateResume && (
            <form onSubmit={createResume} onClick={() => setShowCreateResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
              <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                <h2 className='text-xl font-bold mb-4'>Create a Resume</h2>
                <input onChange={(e) => setTitle(e.target.value)} value={title} type='text' placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-green-600' required />
                <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>Create Resume</button>
                <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setShowCreateResume(false); setTitle('') }} />
              </div>
            </form>
          )
        }

        {showUploadResume && (
          <form onSubmit={uploadResume} onClick={() => setShowUploadResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
              <h2 className='text-xl font-bold mb-4'>Upload Resume</h2>
              <input onChange={(e) => setTitle(e.target.value)} value={title} type='text' placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-green-600' required />
              <div>
                <label htmlFor='resume-input' className='block text-sm text-slate-700'>
                  Select resume File
                  <div className='flex flex-col items-center justify-center gap-2 border group text-slate-400 boder-slate-400 boder-dashed rounded-md p-4 py-10 my-4 hover:border-green-500 hover:text-green-700 cursor-pointer transition-colors'>
                    {resume ? (
                      <p className='text-green-700'>{resume.name}</p>
                    ) : (
                      <>
                        <UploadCloud className='size-14 stroke-1' />
                        <p>Upload resume</p>
                      </>
                    )}
                  </div>
                </label>
                <input type='file' id='resume-input' accept='.pdf' hidden onChange={(e) => setResume(e.target.files[0])} />
              </div>
              <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>Upload Resume</button>
              <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setShowUploadResume(false); setTitle('') }} />
            </div>
          </form>)
        }

        {
          editResumeId && (
            <form onSubmit={editTitle} onClick={() => setEditResumeId('')} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
              <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                <h2 className='text-xl font-bold mb-4'>Edit Resume title</h2>
                <input onChange={(e) => setTitle(e.target.value)} value={title} type='text' placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-green-600' required />
                <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>Update</button>
                <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setEditResumeId(''); setTitle('') }} />
              </div>
            </form>
          )
        }

      </div>

    </div>
  )
}

export default Dashboard