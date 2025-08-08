"use client"

import DebugApi from "@/components/debug-api"

export default function ApiDebugPage() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8">API Connection Debugger</h1>
      <DebugApi />
    </div>
  )
}