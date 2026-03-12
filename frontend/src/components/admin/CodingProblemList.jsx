import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import axios from 'axios'
import { CODING_PROBLEM_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Plus, Loader2 } from 'lucide-react'

const CodingProblemList = () => {
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
            toast.error("Failed to fetch coding problems")
        } finally {
            setLoading(false)
        }
    }

    const deleteHandler = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this problem?");
        if (!confirmed) return;

        try {
            console.log("Deleting problem with ID:", id); // Debug log
            const res = await axios.delete(`${CODING_PROBLEM_API_END_POINT}/${id}`, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message || "Problem deleted successfully");
                fetchProblems(); // Automatically refresh the list
            } else {
                toast.error(res.data.message || "Failed to delete problem");
            }
        } catch (error) {
            console.error("Delete request failed:", error);
            toast.error(error.response?.data?.message || "Failed to delete problem. Please try again.");
        }
    };

    useEffect(() => {
        fetchProblems()
    }, [])

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto my-10 px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Manage Coding Problems</h1>
                        <p className="text-gray-500 mt-1">Review, edit, or remove coding challenges from the platform.</p>
                    </div>
                    <Button onClick={() => navigate("/admin/coding-problems")} className="bg-[#0052CC] hover:bg-[#003FA3] text-white flex items-center gap-2 shadow-md">
                        <Plus size={18} /> Add New Problem
                    </Button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <p className="text-gray-500 font-medium">Loading problems...</p>
                    </div>
                ) : problems.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-lg">No coding problems found. Add your first problem to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Problem Title</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {problems.map((problem) => (
                                    <tr key={problem._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{problem.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-tighter ${problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(problem.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <Button
                                                onClick={() => navigate(`/admin/coding-problems/edit/${problem._id}`)}
                                                variant="outline"
                                                size="sm"
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                            >
                                                <Edit2 size={16} className="mr-1" /> Edit
                                            </Button>
                                            <Button
                                                onClick={() => deleteHandler(problem._id)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                <Trash2 size={16} className="mr-1" /> Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CodingProblemList
