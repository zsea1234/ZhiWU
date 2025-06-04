"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, FileText, Download, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Lease {
  id: number
  property_id: number
  tenant_id: number
  landlord_id: number
  start_date: string
  end_date: string
  monthly_rent_amount: string
  deposit_amount: string
  status: 'draft' | 'pending_tenant_signature' | 'pending_landlord_signature' | 'active' | 'expired' | 'terminated_early' | 'payment_due'
  landlord_signed_at: string | null
  tenant_signed_at: string | null
  created_at: string
  updated_at: string
  additional_terms: string | null
  contract_document_url: string | null
  payment_due_day_of_month: number
  termination_date: string | null
  termination_reason: string | null
  landlord_info: {
    id: number
    username: string
    email: string
    phone: string
  }
  property_summary: {
    id: number
    title: string
    address_line1: string
    city: string
    district: string
    property_type: string
    area_sqm: number
    bedrooms: number
    bathrooms: number
  }
}

export default function LeasesPage() {
  const { toast } = useToast()
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null)
  const [contractPreviewOpen, setContractPreviewOpen] = useState(false)

  useEffect(() => {
    fetchLeases()
  }, [])

  const fetchLeases = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/leases')
      const data = await response.json()
      setLeases(data.data)
    } catch (error) {
      console.error('Error fetching leases:', error)
      toast({
        title: "错误",
        description: "获取租赁合同列表失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignLease = async (leaseId: number) => {
    try {
      const response = await fetch(`/api/v1/leases/${leaseId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature_data: 'UserConfirmedAgreement_Timestamp'
        })
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "合同已签署"
        })
        fetchLeases()
      } else {
        throw new Error('签署合同失败')
      }
    } catch (error) {
      console.error('Error signing lease:', error)
      toast({
        title: "错误",
        description: "签署合同失败",
        variant: "destructive"
      })
    }
  }

  const handleViewContract = (lease: Lease) => {
    setSelectedLease(lease)
    setContractPreviewOpen(true)
  }

  const handleDownloadContract = (url: string) => {
    window.open(url, '_blank')
  }

  const getStatusBadge = (status: Lease['status']) => {
    const statusMap = {
      'draft': { label: '草稿', variant: 'secondary' },
      'pending_tenant_signature': { label: '待租客签署', variant: 'warning' },
      'pending_landlord_signature': { label: '待房东签署', variant: 'warning' },
      'active': { label: '生效中', variant: 'success' },
      'expired': { label: '已到期', variant: 'secondary' },
      'terminated_early': { label: '提前终止', variant: 'destructive' },
      'payment_due': { label: '租金逾期', variant: 'destructive' }
    }
    const { label, variant } = statusMap[status]
    return <Badge variant={variant as any}>{label}</Badge>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">租赁合同</h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {leases.map((lease) => (
            <Card key={lease.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{lease.property_summary.title}</CardTitle>
                    <CardDescription>
                      {lease.property_summary.address_line1}, {lease.property_summary.city}
                    </CardDescription>
                  </div>
                  {getStatusBadge(lease.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">租期</p>
                      <p className="text-sm text-gray-500">
                        {lease.start_date} 至 {lease.end_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">月租金</p>
                      <p className="text-sm text-gray-500">¥{lease.monthly_rent_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">押金</p>
                      <p className="text-sm text-gray-500">¥{lease.deposit_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">租金支付日</p>
                      <p className="text-sm text-gray-500">每月{lease.payment_due_day_of_month}号</p>
                    </div>
                  </div>

                  {lease.additional_terms && (
                    <div>
                      <p className="text-sm font-medium">附加条款</p>
                      <p className="text-sm text-gray-500">{lease.additional_terms}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      房东：{lease.landlord_info.username}
                      <br />
                      联系电话：{lease.landlord_info.phone}
                    </div>
                    <div className="space-x-2">
                      {lease.contract_document_url && (
                        <Button
                          variant="outline"
                          onClick={() => handleViewContract(lease)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          查看合同
                        </Button>
                      )}
                      {lease.status === 'pending_tenant_signature' && (
                        <Button onClick={() => handleSignLease(lease.id)}>
                          签署合同
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 合同预览对话框 */}
      <Dialog open={contractPreviewOpen} onOpenChange={setContractPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>租赁合同预览</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p>房东：{selectedLease?.landlord_info.username}</p>
                <p>房源：{selectedLease?.property_summary.title}</p>
              </div>
              {selectedLease?.contract_document_url && (
                <Button
                  variant="outline"
                  onClick={() => handleDownloadContract(selectedLease.contract_document_url!)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载合同
                </Button>
              )}
            </div>
            {selectedLease?.contract_document_url && (
              <iframe
                src={selectedLease.contract_document_url}
                className="w-full h-[600px] border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}