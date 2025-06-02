"use client"

import { useState, useEffect } from 'react';
import { maintenanceService, MaintenanceRequest, MaintenanceRequestCreateInput } from '@/app/services/maintenance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<MaintenanceRequestCreateInput>({
    property_id: 0,
    description: '',
    preferred_contact_time: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await maintenanceService.getMaintenanceRequests();
      setRequests(response.data);
    } catch (error) {
      toast.error('获取维修申请列表失败');
      console.error('获取维修申请列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.property_id || !formData.description) {
      toast.error('请填写完整信息');
      return;
    }

    setSubmitting(true);
    try {
      await maintenanceService.createMaintenanceRequest(formData);
      toast.success('维修申请提交成功');
      setFormData({
        property_id: 0,
        description: '',
        preferred_contact_time: ''
      });
      fetchRequests();
    } catch (error) {
      toast.error('提交维修申请失败');
      console.error('提交维修申请失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending_assignment: { label: '待指派', variant: 'secondary' },
      assigned_to_worker: { label: '已指派', variant: 'default' },
      in_progress: { label: '处理中', variant: 'default' },
      completed: { label: '已完成', variant: 'outline' },
      cancelled_by_tenant: { label: '已取消', variant: 'destructive' },
      closed_by_landlord: { label: '已关闭', variant: 'destructive' }
    };

    const { label, variant } = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>提交维修申请</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">房源ID</label>
              <Input
                type="number"
                value={formData.property_id || ''}
                onChange={(e) => setFormData({ ...formData, property_id: Number(e.target.value) })}
                placeholder="请输入房源ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">问题描述</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请详细描述需要维修的问题"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">期望联系时间</label>
              <Input
                type="text"
                value={formData.preferred_contact_time || ''}
                onChange={(e) => setFormData({ ...formData, preferred_contact_time: e.target.value })}
                placeholder="例如：工作日下午"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? '提交中...' : '提交申请'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>维修申请记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-center text-gray-500">暂无维修申请记录</p>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{request.property_summary.title}</h3>
                      <p className="text-sm text-gray-500">{request.property_summary.address_summary}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm">{request.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>提交时间：{format(new Date(request.submitted_at), 'PPP', { locale: zhCN })}</p>
                    {request.completed_at && (
                      <p>完成时间：{format(new Date(request.completed_at), 'PPP', { locale: zhCN })}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}