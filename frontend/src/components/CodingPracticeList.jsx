import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import { Button } from './ui/button'
import axios from 'axios'
import { CODING_PROBLEM_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2, ChevronRight, Code2 } from 'lucide-react'

const CodingPracticeList = () => {
    const [problems, setProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchProblems = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${CODING_PROBLEM_API_END_POINT}/get`, { withCredentials: true })
            if (res.data.success) {
                setProblems(res.data.problems)
            }
        } catch (error) {
            console.log(error)
            toast.error("Failed to load problems")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProblems()
    }, [])

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto my-12 px-6">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Master Your Coding Skills</h1>
                    <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">Practice daily, solve challenges, and prepare for top-tier technical interviews with our curated problem set.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="mt-4 text-gray-500 font-medium tracking-wide">Fetching challenges...</p>
                    </div>
                ) : problems.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                        <Code2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">No problems available yet</h3>
                        <p className="text-gray-400 mt-2">Check back soon for new coding challenges!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {problems.map((problem) => (
                            <div
                                key={problem._id}
                                className="group relative bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
                                onClick={() => navigate(`/coding-practice/${problem._id}`)}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg transform rotate-45 group-hover:rotate-0 transition-transform duration-300">
                                        <Code2 size={20} />
                                    </div>
                                </div>

                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${problem.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                                        problem.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' :
                                            'bg-rose-50 text-rose-600'
                                    }`}>
                                    {problem.difficulty}
                                </span>

                                <h2 className="text-xl font-bold text-gray-900 mt-4 mb-3 line-clamp-1">{problem.title}</h2>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{problem.description}</p>

                                <div className="flex items-center justify-between border-t border-gray-50 pt-5">
                                    <span className="text-xs text-gray-400 font-medium">Added {new Date(problem.createdAt).toLocaleDateString()}</span>
                                    <div className="flex items-center text-blue-600 font-bold text-sm tracking-wide group-hover:gap-2 transition-all">
                                        Solve Now <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CodingPracticeList
