'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react' // ✅ Import hooks
import useAuthStore from '@/stores/authStore'
import ContentWrapper from '@/components/ContentWrapper'
import { Shield, User, LogOut, ChevronRight, Activity, Smartphone, Monitor } from 'lucide-react'

// ✅ Define Log Interface
interface ActivityLog {
  id: string
  action: string
  ipAddress: string
  userAgent: string
  createdAt: string
  details?: any
}

export default function AccountPage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [logs, setLogs] = useState<ActivityLog[]>([]) // ✅ State for logs
  const [loadingLogs, setLoadingLogs] = useState(false)

  // ✅ Fetch Logs on Mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoadingLogs(true)
        const token = localStorage.getItem('authToken')
        if (!token) return

        const res = await fetch('/api/users/activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setLogs(data.data)
        }
      } catch (err) {
        console.error("Failed to load activity logs", err)
      } finally {
        setLoadingLogs(false)
      }
    }

    if (user) fetchLogs()
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // ✅ Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  // ✅ Helper to clean User Agent
  const getDeviceName = (ua: string) => {
    if (!ua) return 'Unknown Device'
    if (ua.includes('Mobile')) return 'Mobile Device'
    if (ua.includes('Mac')) return 'Mac Desktop'
    if (ua.includes('Win')) return 'Windows Desktop'
    return 'Desktop Device'
  }

  if (!user) return null

  return (
    <ContentWrapper>
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Account</h1>
        <p className="text-slate-500 mb-8">{user.name} • {user.email}</p>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-semibold text-slate-900 flex items-center gap-2 bg-slate-50/50">
                <User size={18} className="text-teal-600" /> Profile Settings
            </div>
            <div className="p-4">
                <div className="flex justify-between py-3 border-b border-slate-50">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-medium text-slate-900">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex justify-between py-3">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-900">{user.phone || 'Not set'}</span>
                </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-semibold text-slate-900 flex items-center gap-2 bg-slate-50/50">
                <Shield size={18} className="text-teal-600" /> Security
            </div>
            
            {/* Link to 2FA Page */}
            <Link href="/account/2fa" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div>
                    <div className="font-medium text-slate-900">Two-Factor Authentication</div>
                    <div className="text-sm text-slate-500">
                        {user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-400 group-hover:text-slate-600" />
            </Link>
          </div>

          {/* ✅ RECENT ACTIVITY LOGS */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-semibold text-slate-900 flex items-center gap-2 bg-slate-50/50">
                <Activity size={18} className="text-teal-600" /> Recent Activity
            </div>
            <div className="divide-y divide-slate-100">
              {loadingLogs ? (
                <div className="p-6 text-center text-slate-400 text-sm">Loading activity...</div>
              ) : logs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">No recent activity recorded.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-1.5 rounded-full ${log.action.includes('FAILED') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {/* Dynamic Icon based on parsed OS */}
                        {log.details?.os?.includes('Android') || log.details?.os?.includes('iOS') ? 
                          <Smartphone size={14} /> : <Monitor size={14} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        
                        {/* ✅ IMPROVED: Show Location and Parsed Device Name */}
                        <p className="text-xs text-slate-500">
                          {log.details?.device || getDeviceName(log.userAgent)} 
                          <span className="mx-1">•</span> 
                          {log.details?.location || log.ipAddress}
                        </p>
                        
                        {log.action.includes('FAILED') && log.details?.reason && (
                            <p className="text-xs text-red-500 mt-0.5">Reason: {log.details.reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-medium p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </div>
    </ContentWrapper>
  )
}