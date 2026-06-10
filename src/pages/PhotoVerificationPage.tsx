import { Camera, Upload, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { useParams } from 'react-router-dom';

export default function PhotoVerificationPage() {
  const { taskId } = useParams<{ taskId: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">拍照验收</h1>
          <p className="text-sm text-slate-500 mt-1">
            {taskId ? `任务编号: ${taskId}` : '选择巡检任务进行拍照验收'}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Upload className="w-4 h-4" />
          上传照片
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="待拍照项"
          value={12}
          icon={<Camera className="w-5 h-5" />}
        />
        <StatCard
          title="已拍照"
          value={8}
          change={33.3}
          icon={<ImageIcon className="w-5 h-5" />}
        />
        <StatCard
          title="已通过"
          value={6}
          icon={<CheckCircle2 className="w-5 h-5 text-success-500" />}
        />
        <StatCard
          title="需重拍"
          value={2}
          change={-50.0}
          icon={<XCircle className="w-5 h-5 text-danger-500" />}
        />
      </div>

      <div className="rounded-[10px] bg-white shadow-card p-8">
        <EmptyState
          icon={<Camera className="w-12 h-12" />}
          title="拍照验收工作台"
          description="拍照与标注组件开发中，敬请期待"
        />
      </div>
    </div>
  );
}
