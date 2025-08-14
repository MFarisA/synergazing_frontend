"use client"

import { useState, useEffect } from 'react'
import { apiUtils } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Code } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DebugApi() {
  const [testResult, setTestResult] = useState<{ status: string; message: string; details?: any } | null>(null)
  const [registerEndpointResult, setRegisterEndpointResult] = useState<{ status: string; message: string; details?: any } | null>(null)
  const [loading, setLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const result = await apiUtils.testConnection()
      setTestResult(result)
    } catch (error: any) {
      setTestResult({
        status: 'error',
        message: `Error testing connection: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }
  
  const testRegisterEndpoint = async () => {
    setRegisterLoading(true)
    try {
      const result = await apiUtils.testRegisterEndpoint()
      setRegisterEndpointResult(result)
    } catch (error: any) {
      setRegisterEndpointResult({
        status: 'error',
        message: `Error testing registration endpoint: ${error.message}`
      })
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>API Connection Tester</CardTitle>
        <CardDescription>Test your connection to the Go backend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="health">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="health">Health Check</TabsTrigger>
            <TabsTrigger value="register">Register Endpoint</TabsTrigger>
          </TabsList>
          
          <TabsContent value="health" className="space-y-4 pt-4">
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Backend Health'}
            </Button>
            
            {testResult && (
              <div className={`p-4 rounded-md ${
                testResult.status === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.status === 'success' 
                    ? <CheckCircle className="h-5 w-5 text-green-500" /> 
                    : <AlertCircle className="h-5 w-5 text-red-500" />
                  }
                  <p className={`text-sm font-medium ${
                    testResult.status === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {testResult.message}
                  </p>
                </div>
                
                {testResult.details && (
                  <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                    <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 pt-4">
            <Button 
              onClick={testRegisterEndpoint} 
              disabled={registerLoading}
              className="w-full"
            >
              {registerLoading ? 'Testing...' : 'Test Register Endpoint'}
            </Button>
            
            {registerEndpointResult && (
              <div className={`p-4 rounded-md ${
                registerEndpointResult.status === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {registerEndpointResult.status === 'success' 
                    ? <CheckCircle className="h-5 w-5 text-green-500" /> 
                    : <AlertCircle className="h-5 w-5 text-red-500" />
                  }
                  <p className={`text-sm font-medium ${
                    registerEndpointResult.status === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {registerEndpointResult.message}
                  </p>
                </div>
                
                {registerEndpointResult.details && (
                  <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                    <pre>{JSON.stringify(registerEndpointResult.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="border rounded-md p-4 text-sm text-gray-600">
          <h4 className="font-medium mb-2">401 Unauthorized Troubleshooting:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>The 401 error indicates the API requires authentication</li>
            <li>Check if your backend requires API keys or authentication tokens for new registrations</li>
            <li>Verify if your Go backend has middleware that requires authentication for all routes</li>
            <li>Check if the endpoint URL is correct: {process.env.NEXT_PUBLIC_API_URL }/api/auth/register</li>
          </ul>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Next Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Contact your backend developer to confirm registration endpoint requirements</li>
            <li>Check if the registration endpoint should be public (no auth required)</li>
            <li>Verify that your backend's CORS settings allow requests from your frontend</li>
            <li>Review backend logs for more detailed error information</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}