'use client';

import React from "react";

const ProjectCartSkeleton: React.FC = () => {
    return (
        <div className="relative flex flex-col items-center justify-between w-full h-full rounded-lg border border-gray-300 bg-white p-6 shadow-sm animate-pulse dark:border-gray-700 dark:bg-gray-800">
            {/* Menu button placeholder */}
            <div className="absolute right-2 top-2 h-6 w-6 rounded-md bg-gray-300 dark:bg-gray-700"></div>

            {/* Image placeholder */}
            <div className="mb-6 h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-700" />
            {/* Title placeholder */}
            <div className="h-6 w-32 rounded bg-gray-300 mb-2 dark:bg-gray-700"></div>
            {/* Description placeholder */}
            <div className="w-full">
                <div className="h-3 w-72 rounded bg-gray-300 mb-1 dark:bg-gray-700"></div>
                <div className="h-3 w-60 rounded bg-gray-300 mb-1 dark:bg-gray-700"></div>
                <div className="h-3 w-56 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>

            {/* Created/Updated At placeholder */}
            <div className="mt-4 flex justify-between w-full gap-1">
                <div className="h-2 w-40 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-2 w-40 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>

            {/* Buttons placeholder */}
            <div className="mt-4 flex gap-4 mx-auto w-full justify-center">
                <div className="h-10 w-36 rounded-md bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-10 w-24 rounded-md bg-gray-300 dark:bg-gray-700"></div>
            </div>
        </div>
    );
};

export default ProjectCartSkeleton;
