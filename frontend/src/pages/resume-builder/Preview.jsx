import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import ResumePreview from '../../components/resume-builder/ResumePreview'
import { ArrowLeftIcon, Loader2 } from 'lucide-react'

const Preview = () => {
  const { resumeId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState(null)
  const [error, setError] = useState(false)

  const loadResume = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get(`/ai/resume/${resumeId}`);
      if (data.resume) {
        setResumeData(data.resume);
      } else {
        setError(true)
      }
    } catch (err) {
      console.error("Error loading resume:", err);
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (resumeId) {
      loadResume()
    }
  }, [resumeId])

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <Loader2 className='size-12 animate-spin text-slate-400' />
        <p className='mt-4 text-slate-500'>Loading Resume...</p>
      </div>
    )
  }

  if (error || !resumeData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[80vh] bg-slate-50'>
        <p className='text-6xl text-slate-300 font-bold mb-4 italic'>404</p>
        <p className='text-xl text-slate-500 mb-8'>Resume Not Found</p>
        <Link to="/resume-builder" className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg transition-all shadow-md'>
          <ArrowLeftIcon className='size-4' />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-100/50 print:bg-white'>
      <div className='max-w-5xl mx-auto py-12 px-4 print:py-0 print:px-0'>
        <div className='mb-6 flex justify-between items-center print:hidden'>
          <Link to={`/resume-builder/builder/${resumeId}`} className='text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors'>
            <ArrowLeftIcon className='size-4' />
            Back to Editor
          </Link>
          <button onClick={() => window.print()} className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow transition-all'>
            Print / Download
          </button>
        </div>
        <div className='bg-white shadow-2xl rounded-sm ring-1 ring-slate-200 overflow-hidden print:shadow-none print:ring-0'>
          <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} />
        </div>
      </div>
    </div>
  )
}

export default Preview