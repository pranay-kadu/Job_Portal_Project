import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const Tracker = ({ steps, currentStep }) => {
    // Determine active steps or completed steps
    // steps is array of { name, status, date }
    // currentStep is number (index)

    return (
        <div className="flex flex-col space-y-4 p-4">
            {steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = index === currentStep && step.status !== 'completed';
                // const isPending = step.status === 'pending' && !isCurrent;

                return (
                    <div key={index} className="flex gap-4">
                        {/* Status Icon & Line */}
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                                isCompleted ? "border-green-500 bg-green-500 text-white" :
                                    isCurrent ? "border-blue-500 bg-white text-blue-500" :
                                        "border-gray-300 bg-white text-gray-300"
                            )}>
                                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> :
                                    isCurrent ? <Clock className="h-5 w-5 animate-pulse" /> :
                                        <Circle className="h-5 w-5" />}
                            </div>
                            {index !== steps.length - 1 && (
                                <div className={cn(
                                    "h-full w-0.5 my-1",
                                    isCompleted ? "bg-green-500" : "bg-gray-300"
                                )} />
                            )}
                        </div>

                        {/* Content */}
                        <div className="pb-8 pt-0.5">
                            <p className={cn(
                                "text-sm font-medium",
                                isCompleted ? "text-green-600" :
                                    isCurrent ? "text-blue-600" :
                                        "text-gray-500"
                            )}>
                                {step.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {step.status === 'completed' && step.date ? new Date(step.date).toDateString() :
                                    isCompleted ? "Completed" :
                                        isCurrent ? "In Progress" : "Pending"}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Tracker;
