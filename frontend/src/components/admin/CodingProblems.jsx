import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { CODING_PROBLEM_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2, Plus, Trash2 } from 'lucide-react'

const CodingProblems = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const [input, setInput] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        examples: [{ input: '', output: '' }],
        testCases: [{ input: '', output: '', isHidden: false }]
    })

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
            const res = await axios.post(`${CODING_PROBLEM_API_END_POINT}/create`, input, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            })

            if (res.data.success) {
                toast.success("Problem created successfully")
                // Clear form
                setInput({
                    title: '',
                    description: '',
                    difficulty: 'medium',
                    examples: [{ input: '', output: '' }],
                    testCases: [{ input: '', output: '', isHidden: false }]
                })
                navigate("/admin/coding-problems/list")
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'Request failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto my-10 p-8 border border-gray-200 shadow-xl rounded-xl bg-white">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Add Coding Problem</h1>
                <form onSubmit={submitHandler} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-semibold text-gray-700">Problem Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="mt-1 focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Reverse a String"
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-semibold text-gray-700">Problem Description</Label>
                            <textarea
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                placeholder="Write the complete problem statement here..."
                                required
                            />
                        </div>
                        <div className="w-full sm:w-1/3">
                            <Label className="text-sm font-semibold text-gray-700">Difficulty</Label>
                            <Select onValueChange={selectChangeHandler} defaultValue="medium">
                                <SelectTrigger className="mt-1">
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
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <Label className="text-xl font-bold text-gray-800">Examples</Label>
                                <Button type="button" onClick={addExample} variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                                    <Plus size={16} className="mr-1" /> Add Example
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {input.examples.map((example, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative group transition-all hover:border-blue-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs uppercase tracking-wider text-gray-500">Example Input</Label>
                                                <textarea
                                                    value={example.input}
                                                    onChange={(e) => exampleChangeHandler(index, 'input', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1 h-32 font-mono"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase tracking-wider text-gray-500">Example Output</Label>
                                                <textarea
                                                    value={example.output}
                                                    onChange={(e) => exampleChangeHandler(index, 'output', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1 h-32 font-mono"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {input.examples.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => removeExample(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Test Cases Section */}
                        <div className="mt-8 border-t pt-8">
                            <div className="flex justify-between items-center mb-4">
                                <Label className="text-xl font-bold text-gray-800">Test Cases</Label>
                                <Button type="button" onClick={addTestCase} variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                                    <Plus size={16} className="mr-1" /> Add Test Case
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {input.testCases.map((testCase, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative group transition-all hover:border-green-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs uppercase tracking-wider text-gray-500">Input</Label>
                                                <textarea
                                                    value={testCase.input}
                                                    onChange={(e) => testCaseChangeHandler(index, 'input', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1 h-32 font-mono"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase tracking-wider text-gray-500">Expected Output</Label>
                                                <textarea
                                                    value={testCase.output}
                                                    onChange={(e) => testCaseChangeHandler(index, 'output', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1 h-32 font-mono"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-4">
                                            <input
                                                type="checkbox"
                                                checked={testCase.isHidden}
                                                onChange={(e) => testCaseChangeHandler(index, 'isHidden', e.target.checked)}
                                                id={`hidden-${index}`}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <Label htmlFor={`hidden-${index}`} className="text-sm text-gray-600 cursor-pointer select-none">
                                                Mark as Hidden Test Case
                                            </Label>
                                        </div>
                                        {input.testCases.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => removeTestCase(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        {loading ? (
                            <Button disabled className="w-full py-6 text-lg">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full py-6 text-lg bg-[#0052CC] hover:bg-[#003FA3] text-white shadow-lg transition-all transform hover:-translate-y-0.5">
                                Save Coding Problem
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CodingProblems
