// Enhanced ApiDebugger.tsx
import React, { useState } from "react";
import api from "../api/api"; // Import the axios instance directly

const ApiDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testConnection = async () => {
    setIsTesting(true);
    const token = localStorage.getItem("token");
    
    const info = {
      tokenExists: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? token.substring(0, 30) + "..." : "No token",
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      timestamp: new Date().toISOString()
    };

    try {
      console.log("=== Testing API Connection ===");
      
      // Test 1: Direct axios call
      console.log("Test 1: Direct API call to /auth/me");
      const response = await api.get("/auth/me");
      
      setDebugInfo({
        ...info,
        test1: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          requestUrl: response.config.url,
          requestHeaders: response.config.headers
        },
        conclusion: "API call successful but user data might be missing"
      });

    } catch (error: any) {
      setDebugInfo({
        ...info,
        test1: {
          error: true,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: error.config
        },
        conclusion: "API call failed"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testWithoutInterceptor = async () => {
    const token = localStorage.getItem("token");
    
    try {
      console.log("Test 2: Direct fetch without axios interceptor");
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      setDebugInfo(prev => ({
        ...prev,
        test2: {
          status: response.status,
          ok: response.ok,
          data: data,
          headers: Object.fromEntries(response.headers.entries())
        }
      }));
    } catch (error: any) {
      setDebugInfo(prev => ({
        ...prev,
        test2: {
          error: true,
          message: error.message
        }
      }));
    }
  };

  return (
    <div className="p-4 bg-gray-100 border rounded-lg max-w-4xl mx-auto mt-4">
      <h3 className="font-bold text-lg mb-2">Advanced API Debugger</h3>
      
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={testConnection}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isTesting ? "Testing..." : "Test API Connection"}
        </button>
        
        <button 
          onClick={testWithoutInterceptor}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Direct Fetch
        </button>
      </div>
      
      {debugInfo && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded">
            <h4 className="font-semibold">Basic Info:</h4>
            <pre className="text-sm">{JSON.stringify({
              tokenExists: debugInfo.tokenExists,
              tokenLength: debugInfo.tokenLength,
              apiBaseUrl: debugInfo.apiBaseUrl
            }, null, 2)}</pre>
          </div>
          
          {debugInfo.test1 && (
            <div className="bg-white p-3 rounded">
              <h4 className="font-semibold">Test 1 - Axios API Call:</h4>
              <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(debugInfo.test1, null, 2)}</pre>
            </div>
          )}
          
          {debugInfo.test2 && (
            <div className="bg-white p-3 rounded">
              <h4 className="font-semibold">Test 2 - Direct Fetch:</h4>
              <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(debugInfo.test2, null, 2)}</pre>
            </div>
          )}
          
          {debugInfo.conclusion && (
            <div className="bg-yellow-100 p-3 rounded">
              <h4 className="font-semibold">Conclusion:</h4>
              <p>{debugInfo.conclusion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;