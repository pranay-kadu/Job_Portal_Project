import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { CODING_PROBLEM_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react'

const EditCodingProblem = () => {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const navigate = useNavigate()
    const { id } = useParams()

    const [input, setInput] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        examples: [{ input: '', output: '' }],
        testCases: [{ input: '', output: '', isHidden: false }]
    })

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setFetching(true)
                const res = await axios.get(`${CODING_PROBLEM_API_END_POINT}/get`, { withCredentials: true })
                if (res.data.success) {
                    const problem = res.data.problems.find(p => p._id === id)
                    if (problem) {
                        setInput({
                            title: problem.title,
                            description: problem.description,
                            difficulty: problem.difficulty,
                            examples: problem.examples,
                            testCases: problem.testCases
                        })
                    } else {
                        toast.error("Problem not found")
                        navigate("/admin/coding-problems/list")
                    }
                }
            } catch (error) {
                console.log(error)
                toast.error("Failed to fetch problem data")
            } finally {
                setFetching(false)
            }
        }
        fetchProblem()
    }, [id, navigate])

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value })
    }

    const selectChangeHandler = (value) => {
        setInput({ ...input, difficulty: value })
    }

    // Dynamic Examples
    const addExample = () => {
        setInput({
            ...input,
            examples: [...input.examples, { input: '', output: '' }]
        })
    }
    const removeExample = (index) => {
        const newExamples = [...input.examples]
        newExamples.splice(index, 1)
        setInput({ ...input, examples: newExamples })
    }
    const exampleChangeHandler = (index, field, value) => {
        const newExamples = [...input.examples]
        newExamples[index][field] = value
        setInput({ ...input, examples: newExamples })
    }

    // Dynamic Test Cases
    const addTestCase = () => {
        setInput({
            ...input,
            testCases: [...input.testCases, { input: '', output: '', isHidden: false }]
        })
    }
    const removeTestCase = (index) => {
        const newTestCases = [...input.testCases]
        newTestCases.splice(index, 1)
        setInput({ ...input, testCases: newTestCases })
    }
    const testCaseChangeHandler = (index, field, value) => {
        const newTestCases = [...input.testCases]
        newTestCases[index][field] = value
        setInput({ ...input, testCases: newTestCases })
    }

    const submitHandler = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await axios.put(`${CODING_PROBLEM_API_END_POINT}/${id}`, input, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            })

            if (res.data.success) {
                toast.success("Problem updated successfully");
                // Using navigate to redirect back to the list page
                console.log("Update successful, redirecting to list...");
                setTimeout(() => {
                    navigate("/admin/coding-problems/list");
                }, 100); // Tiny delay to ensure toast is visible
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'Update failed')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading problem data...</p>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto my-10 p-8 border border-gray-200 shadow-2xl rounded-2xl bg-white relative">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin/coding-problems/list")}
                    className="mb-6 -ml-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to List
                </Button>

                <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Edit Coding Problem</h1>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div className="space-y-6">
                        <div>
                            <Label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Problem Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="mt-2 py-6 focus:ring-2 focus:ring-blue-500 bg-gray-50 border-gray-200"
                                placeholder="e.g. Reverse a String"
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Problem Description</Label>
                            <textarea
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="flex min-h-[160px] w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 transition-all"
                                placeholder="Describe the problem, input format, and output format..."
                                required
                            />
                        </div>
                        <div className="w-full sm:w-1/3">
                            <Label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Difficulty</Label>
                            <Select onValueChange={selectChangeHandler} defaultValue={input.difficulty}>
                                <SelectTrigger className="mt-2 bg-gray-50 border-gray-200 h-12">
                                    <SelectValue placeholder="Select Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Examples Section */}
                        <div className="mt-10 bg-blue-50/20 p-6 rounded-2xl border border-blue-100">
                            <div className="flex justify-between items-center mb-6">
                                <Label className="text-xl font-bold text-blue-900">Problem Examples</Label>
                                <Button type="button" onClick={addExample} variant="outline" size="sm" className="bg-white text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white transition-all">
                                    <Plus size={16} className="mr-1" /> Add Example
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {input.examples.map((example, index) => (
                                    <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative group transition-all hover:border-blue-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Example Input</Label>
                                                <textarea
                                                    value={example.input}
                                                    onChange={(e) => exampleChangeHandler(index, 'input', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm mt-1 h-32 font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Example Output</Label>
                                                <textarea
                                                    value={example.output}
                                                    onChange={(e) => exampleChangeHandler(index, 'output', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm mt-1 h-32 font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {input.examples.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => removeExample(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity p-2 h-auto"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Test Cases Section */}
                        <div className="mt-10 bg-green-50/20 p-6 rounded-2xl border border-green-100">
                            <div className="flex justify-between items-center mb-6">
                                <Label className="text-xl font-bold text-green-900">System Test Cases</Label>
                                <Button type="button" onClick={addTestCase} variant="outline" size="sm" className="bg-white text-green-600 border-green-200 hover:bg-green-600 hover:text-white transition-all">
                                    <Plus size={16} className="mr-1" /> Add Test Case
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {input.testCases.map((testCase, index) => (
                                    <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative group transition-all hover:border-green-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">System Input</Label>
                                                <textarea
                                                    value={testCase.input}
                                                    onChange={(e) => testCaseChangeHandler(index, 'input', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm mt-1 h-32 font-mono focus:ring-1 focus:ring-green-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Expected Output</Label>
                                                <textarea
                                                    value={testCase.output}
                                                    onChange={(e) => testCaseChangeHandler(index, 'output', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm mt-1 h-32 font-mono focus:ring-1 focus:ring-green-500 outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 mt-4 bg-gray-50 p-3 rounded-lg w-fit">
                                            <input
                                                type="checkbox"
                                                checked={testCase.isHidden}
                                                onChange={(e) => testCaseChangeHandler(index, 'isHidden', e.target.checked)}
                                                id={`hidden-${index}`}
                                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                                            />
                                            <Label htmlFor={`hidden-${index}`} className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                                                Hidden from Student View
                                            </Label>
                                        </div>
                                        {input.testCases.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => removeTestCase(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity p-2 h-auto"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t mt-10">
                        {loading ? (
                            <Button disabled className="w-full py-8 text-xl rounded-xl">
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Synchronizing Changes...
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full py-8 text-xl font-bold bg-[#0052CC] hover:bg-[#003FA3] text-white shadow-xl rounded-xl transition-all transform hover:-translate-y-1 active:translate-y-0">
                                Update Problem
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditCodingProblem
