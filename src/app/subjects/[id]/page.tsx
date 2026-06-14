import { SubjectDetail } from '@/components/subjects/SubjectDetail';

// 服务端薄封装：取出动态参数 id 后交给客户端组件渲染
export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubjectDetail id={id} />;
}
